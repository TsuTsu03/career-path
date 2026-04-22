import { jest } from "@jest/globals";

export const mockSave = jest.fn();

class jsPDF {
  setFont(): void {}
  setFontSize(): void {}
  text(): void {}
  setLineWidth(): void {}
  line(): void {}
  setDrawColor(): void {}
  setFillColor(): void {}
  rect(): void {}
  addPage(): void {}
  splitTextToSize(text: string): string[] {
    return [text];
  }
  save(filename: string): void {
    mockSave(filename);
  }
}

export default jsPDF;
