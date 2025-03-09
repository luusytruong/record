import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

export function handleDuplicates(input, str) {
  let question = { text: "", option: [] };
  const lines = str.split("\n");
  const list = [];
  const keys = new Set();

  const normal = (str) => {
    return str
      .replace(/\*?[A-D]\.\s*/g, "")
      .replace(/\s+/g, " ")
      .normalize("NFKC")
      .toLowerCase();
  };

  const handleKey = (str, arr) => {
    return normal(`${str} ${arr.map(normal).sort()}`);
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === "") continue;

    if (trimmedLine.includes("Question")) {
      question = { text: "", option: [] };
    } else if (/\*?[A-D]\.\s*/g.test(trimmedLine)) {
      question.option.push(trimmedLine);
    } else {
      question.text += trimmedLine + "\n";
    }

    if (question.option.length === 4) {
      question.text = question.text.trim();
      const key = handleKey(question.text, question.option);
      if (keys.has(key)) continue;
      list.push({ ...question });
      keys.add(key);
    }
  }

  if (list.length) {
    generateDocx(list);
  } else {
    input.value = "";
    return { error: "Dữ liệu không đúng định dạng" };
  }
}

function generateDocx(list) {
  const size = 28;
  const font = "Times New Roman";

  const getTime = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    return `ngày ${day}_${month}_${year} lúc ${hour}_${minute}_${second}`;
  };

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: list.map((q, i) => [
          new Paragraph({
            children: [
              new TextRun({
                text: `Question ${i + 1}`,
                size: size,
                font: font,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: q.text,
                bold: true,
                size: size,
                font: font,
              }),
            ],
          }),
          ...q.option.map((opt) => {
            const isCorrect = opt.startsWith("*");
            return new Paragraph({
              children: [
                new TextRun({
                  text: opt,
                  bold: isCorrect,
                  color: isCorrect ? "00AA00" : undefined,
                  size: size,
                  font: font,
                }),
              ],
            });
          }),
          new Paragraph(""),
        ]),
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `Câu hỏi ${getTime()}.docx`);
    return { success: `File chứa ${list.length} câu hỏi` };
  });
}
