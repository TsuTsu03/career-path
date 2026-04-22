import { jest } from "@jest/globals";
import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "node:util";

Object.defineProperty(globalThis, "TextEncoder", {
  writable: true,
  value: TextEncoder
});

Object.defineProperty(globalThis, "TextDecoder", {
  writable: true,
  value: TextDecoder
});

const createMatchMedia = (query: string): MediaQueryList => {
  const mediaQueryList = {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  } as MediaQueryList;

  return mediaQueryList;
};

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn((query: string) => createMatchMedia(query))
});

class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

(
  window as Window &
    typeof globalThis & { ResizeObserver: typeof ResizeObserverMock }
).ResizeObserver = ResizeObserverMock;

window.alert = jest.fn();
