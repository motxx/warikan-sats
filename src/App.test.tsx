import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders without crashing", () => {
  const { baseElement } = render(<App />);
  expect(baseElement).toBeDefined();
});

test("redirects the configured root path to the wallet page", async () => {
  window.history.pushState({}, "", "/");

  render(<App />);

  expect(await screen.findByText("History")).toBeTruthy();
  expect(window.location.pathname).toBe("/wallet");
});
