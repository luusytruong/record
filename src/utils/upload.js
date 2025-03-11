import { setStorage } from "./chrome";

export const getClipboard = async () => {
  try {
    const copyText = await navigator.clipboard.readText();
    const result = await handleQuestions(copyText);
    return result;
  } catch (e) {
    console.error(e);
    return { error: e.message };
  }
};

const normal = (str) => {
  return str
    .replace(/\*[a-d]\.\s*/g, "")
    .replace(/\s+/g, " ")
    .normalize("NFKC");
};

const handleQuestions = async (str) => {
  const lines = str.split("\n");
  const select = [];
  let text = "";

  for (const line of lines) {
    const newLine = line.trim().toLowerCase();
    if (newLine === "") continue;
    if (newLine.includes("question")) {
      text = "";
    } else if (/^\*[a-d]\.\s*/.test(newLine)) {
      select.push(normal(text + newLine));
    } else if (!/^[a-d]\.\s*/.test(newLine)) {
      console.log(newLine);
      text += newLine + "\n";
    }
  }

  if (select.length) {
    try {
      await setStorage("auto", select);
      return { success: "Tải lên thành công" };
    } catch (e) {
      return { error: e.message };
    }
  } else {
    return { error: "Dữ liệu không đúng định dạng" };
  }
};
