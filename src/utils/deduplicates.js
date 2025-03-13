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
    const trimLine = line.trim();
    if (trimLine === "") continue;
    if (trimLine.includes("Question")) {
      if (question.text && question.option.length > 1) {
        question.text = question.text.trim();
        const key = handleKey(question.text, question.option);
        if (!keys.has(key)) {
          list.push({ ...question });
          keys.add(key);
        }
      }
      question = { text: "", option: [] };
    } else if (!question.text) {
      question.text = trimLine;
    } else if (/\*?[A-D]\.\s*/g.test(trimLine)) {
      question.option.push(trimLine);
    }
  }

  if (question.text && question.option.length > 1) {
    question.text = question.text.trim();
    const key = handleKey(question.text, question.option);
    if (!keys.has(key)) {
      list.push({ ...question });
      keys.add(key);
    }
  }

  if (list.length) {
    return generateDocx(list);
  } else {
    input.value = "";
    return { error: "Dữ liệu không đúng định dạng" };
  }
}

async function generateDocx(list) {
  const size = 24;
  const font = "Times New Roman";

  const getTime = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    return `${day}_${month}_${year}_${hour}_${minute}_${second}`;
  };

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: list.flatMap((q, i) => [
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

  try {
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `file-${list.length}-questions-${getTime()}.docx`);
    return { success: `File chứa ${list.length} câu hỏi` };
  } catch (e) {
    return { error: e.message };
  }
}
