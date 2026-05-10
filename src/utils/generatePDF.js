import { jsPDF } from 'jspdf';

export function generatePDF(questions, options) {
  const {
    title = 'Question Paper',
    includeAnswers = false,
    generateBoth = false
  } = options;

  function buildPDF(showAnswers) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(title, pageWidth / 2, y, { align: 'center' });
    y += 8;

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `${questions.length} Questions  •  ${new Date().toLocaleDateString()}`,
      pageWidth / 2, y, { align: 'center' }
    );
    y += 10;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    doc.setTextColor(0, 0, 0);

    // Questions
    questions.forEach((q, index) => {
      if (y > 255) { doc.addPage(); y = margin; }

      // Difficulty tag
      if (q.difficulty) {
        const colors = {
          Easy:   [46, 125, 50],
          Medium: [245, 127, 23],
          Hard:   [198, 40, 40]
        };
        const [r, g, b] = colors[q.difficulty];
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(r, g, b);
        doc.text(`[${q.difficulty.toUpperCase()}]`, margin, y);
        doc.setTextColor(0, 0, 0);
        y += 5;
      }

      // Question text
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const qLines = doc.splitTextToSize(
        `${index + 1}.  ${q.body}`, contentWidth
      );
      doc.text(qLines, margin, y);
      y += qLines.length * 6 + 4;

      // Options
      if (q.option_a) {
        doc.setFontSize(10);
        const opts = [
          { label: 'A', text: q.option_a },
          { label: 'B', text: q.option_b },
          { label: 'C', text: q.option_c },
          { label: 'D', text: q.option_d }
        ];
        opts.forEach(opt => {
          if (y > 270) { doc.addPage(); y = margin; }
          const isCorrect = showAnswers && opt.label === q.correct_option;
          if (isCorrect) {
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(46, 125, 50);
          } else {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
          }
          const prefix = isCorrect ? '✓' : '   ';
          const lines = doc.splitTextToSize(
            `${prefix}  ${opt.label}.  ${opt.text}`,
            contentWidth - 10
          );
          doc.text(lines, margin + 8, y);
          y += lines.length * 5 + 2;
        });
      } else {
        // Legacy question — no options
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('(No options — legacy question)', margin + 8, y);
        doc.setTextColor(0, 0, 0);
        y += 5;
      }

      y += 8; // gap between questions
    });

    // Answer key section at end
    if (showAnswers) {
      if (y > 240) { doc.addPage(); y = margin; }
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('Answer Key', margin, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      questions.forEach((q, i) => {
        if (y > 270) { doc.addPage(); y = margin; }
        const answer = q.correct_option
          ? `${i + 1}.  ${q.correct_option}`
          : `${i + 1}.  —`;
        doc.text(answer, margin, y);
        y += 6;
      });
    }

    return doc;
  }

  if (generateBoth) {
    buildPDF(false).save(`${title} - Questions.pdf`);
    setTimeout(() => {
      buildPDF(true).save(`${title} - Answer Key.pdf`);
    }, 600);
  } else {
    buildPDF(includeAnswers).save(`${title}.pdf`);
  }
}
