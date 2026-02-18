const express = require('express');
const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  LevelFormat, TabStopType, ExternalHyperlink
} = require('docx');

const app = express();
app.use(express.json({ limit: '10mb' }));

// ── Health check ──────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'Resume Builder API running' });
});

// ── Main endpoint ─────────────────────────────────────────────────────────
app.post('/build-resume', async (req, res) => {
  try {
    // Accept Claude's raw output or pre-parsed JSON
    let resume = req.body;
    if (typeof resume === 'string') {
      const cleaned = resume.replace(/```json|```/g, '').trim();
      resume = JSON.parse(cleaned);
    }

    // Handle n8n passing Claude output nested under 'text' or 'content'
    if (resume.text) {
      const cleaned = resume.text.replace(/```json|```/g, '').trim();
      resume = JSON.parse(cleaned);
    }

    const { meta, header, summary, skills, experience, education } = resume;

    // ── Constants from template XML analysis ────────────────────────────
    const FONT      = 'Calibri';
    const NAME_SZ   = 28;   // 14pt
    const TITLE_SZ  = 24;   // 12pt
    const BODY_SZ   = 22;   // 11pt
    const SMALL_SZ  = 10;   // spacers
    const RIGHT_TAB = 10080;
    const ROLE_TAB  = 10512;
    const PAGE2_CENTER = 5040;

    // ── Helpers ──────────────────────────────────────────────────────────
    function spacer() {
      return new Paragraph({
        children: [new TextRun({ text: '', font: FONT, size: SMALL_SZ })],
        spacing: { before: 0, after: 0 },
      });
    }

    function sectionHeader(text) {
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, size: TITLE_SZ, font: FONT })],
        spacing: { before: 0, after: 0 },
      });
    }

    function jobDescLine(text) {
      return new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
        indent: { right: -198 },
        children: [new TextRun({ text, italics: true, font: FONT, size: BODY_SZ })],
        spacing: { before: 0, after: 0 },
      });
    }

    function bulletPoint(text) {
      return new Paragraph({
        numbering: { reference: 'resume-bullets', level: 0 },
        tabStops: [{ type: TabStopType.LEFT, position: 450 }],
        indent: { left: 360, right: -198 },
        children: [new TextRun({ text, font: FONT, size: BODY_SZ })],
        spacing: { before: 0, after: 0 },
      });
    }

    function companyLine(company, roleLabel, dates) {
      return new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: ROLE_TAB }],
        children: [
          new TextRun({ text: company + ',', bold: true, font: FONT, size: BODY_SZ }),
          new TextRun({ text: ' ' + roleLabel, font: FONT, size: BODY_SZ }),
          new TextRun({ text: '\t', font: FONT }),
          new TextRun({ text: dates, bold: true, font: FONT, size: BODY_SZ }),
        ],
        spacing: { before: 0, after: 0 },
      });
    }

    function roleTitleLine(teamRole, title, dates) {
      const children = [
        new TextRun({ text: teamRole + ',', bold: true, font: FONT, size: BODY_SZ }),
        new TextRun({ text: title ? ' ' + title : '', font: FONT, size: BODY_SZ }),
      ];
      if (dates) {
        children.push(new TextRun({ text: '\t', font: FONT }));
        children.push(new TextRun({ text: dates, font: FONT, size: BODY_SZ }));
      }
      return new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: ROLE_TAB }],
        children,
        spacing: { before: 0, after: 0 },
      });
    }

    function page2Header(name, email) {
      return new Paragraph({
        tabStops: [
          { type: TabStopType.CENTER, position: PAGE2_CENTER },
          { type: TabStopType.RIGHT, position: RIGHT_TAB },
        ],
        children: [
          new TextRun({ text: name, font: FONT, size: BODY_SZ }),
          new TextRun({ text: '\t', font: FONT }),
          new TextRun({ text: email, font: FONT, size: BODY_SZ }),
          new TextRun({ text: '\t', font: FONT }),
          new TextRun({ text: 'Page 2', font: FONT, size: BODY_SZ }),
        ],
        spacing: { before: 0, after: 0 },
      });
    }

    function buildSkillsLine(skills) {
      const allSkills = [
        ...(skills.leadership_strategy || []),
        ...(skills.product_growth || []),
        ...(skills.data_experimentation || []),
        ...(skills.platforms_tools || []),
      ];
      return new Paragraph({
        children: [new TextRun({ text: allSkills.join(' | '), font: FONT, size: BODY_SZ })],
        spacing: { before: 0, after: 0 },
      });
    }

    // ── Build document children ──────────────────────────────────────────
    const children = [];

    // Name
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      tabStops: [
        { type: TabStopType.LEFT, position: 1620 },
        { type: TabStopType.RIGHT, position: RIGHT_TAB },
      ],
      children: [new TextRun({ text: header.name, bold: true, size: NAME_SZ, font: FONT })],
      spacing: { before: 0, after: 0 },
    }));

    // Contact line
    const contactText = [header.location, header.phone, header.email].filter(Boolean).join(' | ');
    const contactChildren = [new TextRun({ text: contactText + ' | ', size: BODY_SZ, font: FONT })];
    if (header.linkedin) {
      contactChildren.push(new ExternalHyperlink({
        link: header.linkedin.startsWith('http') ? header.linkedin : `https://${header.linkedin}`,
        children: [new TextRun({
          text: header.linkedin.replace('https://', '').replace('http://', ''),
          size: BODY_SZ, font: FONT, style: 'Hyperlink'
        })],
      }));
    }
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
      children: contactChildren,
      spacing: { before: 0, after: 0 },
    }));

    // Work auth
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
      children: [new TextRun({ text: 'Work Authorization: U.S. Permanent Resident (Green Card Holder)', size: BODY_SZ, font: FONT })],
      spacing: { before: 0, after: 0 },
    }));

    children.push(spacer());

    // Target title
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
      children: [new TextRun({ text: meta.target_level || header.title, bold: true, size: TITLE_SZ, font: FONT })],
      spacing: { before: 0, after: 0 },
    }));

    children.push(spacer());

    // Summary
    children.push(new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
      children: [new TextRun({ text: summary, font: FONT, size: BODY_SZ })],
      spacing: { before: 0, after: 0 },
    }));

    children.push(spacer());

    // Core Competencies
    children.push(sectionHeader('Core Competencies'));
    children.push(spacer());
    children.push(buildSkillsLine(skills));
    children.push(spacer());

    // Experiences
    children.push(sectionHeader('Experiences'));
    children.push(spacer());

    experience.forEach((role, idx) => {
      // Insert page 2 header before 3rd role (index 2)
      if (idx === 2) {
        children.push(page2Header(header.name, header.email));
      }

      const locationDept = [role.location, role.department].filter(Boolean).join(', ');
      children.push(companyLine(
        role.company,
        locationDept || 'Product Management',
        role.dates
      ));

      if (role.team && role.title) {
        children.push(roleTitleLine(role.team, role.title, role.role_dates || ''));
      } else if (role.title) {
        children.push(roleTitleLine(role.title, '', role.role_dates || ''));
      }

      if (role.job_description) {
        children.push(jobDescLine(role.job_description));
      }

      (role.bullets || []).forEach(b => children.push(bulletPoint(b)));
      children.push(spacer());
    });

    // Education
    children.push(spacer());
    children.push(sectionHeader('Education'));
    children.push(spacer());

    (education || []).forEach(edu => {
      children.push(new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
        children: [
          new TextRun({ text: edu.degree, bold: true, font: FONT, size: BODY_SZ }),
          new TextRun({ text: ', ', font: FONT, size: BODY_SZ }),
          new TextRun({ text: edu.institution, bold: true, font: FONT, size: BODY_SZ }),
          edu.dates ? new TextRun({ text: '\t' + edu.dates, font: FONT, size: BODY_SZ }) : new TextRun(''),
        ],
        spacing: { before: 0, after: 0 },
      }));
    });

    children.push(spacer());

    // ── Build document ───────────────────────────────────────────────────
    const doc = new Document({
      numbering: {
        config: [{
          reference: 'resume-bullets',
          levels: [{
            level: 0,
            format: LevelFormat.BULLET,
            text: '\u2022',
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: {
                indent: { left: 360, hanging: 180, right: -198 },
              },
            },
          }],
        }],
      },
      styles: {
        default: {
          document: { run: { font: FONT, size: BODY_SZ } },
        },
      },
      sections: [{
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 864, right: 864, bottom: 864, left: 864, header: 720, footer: 720 },
          },
        },
        children,
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = meta.filename || `${meta.company}_Resume.docx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'X-Filename': filename,
    });
    res.send(buffer);

  } catch (err) {
    console.error('Build error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Resume API running on port ${PORT}`));
