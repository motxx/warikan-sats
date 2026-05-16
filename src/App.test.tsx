import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders without crashing", async () => {
  const { baseElement } = render(<App />);

  expect(await screen.findByText("Split collection")).toBeTruthy();
  expect(baseElement).toBeDefined();
});

test("redirects the configured root path to the split collection flow", async () => {
  window.history.pushState({}, "", "/");

  render(<App />);

  expect(await screen.findByText("Split collection")).toBeTruthy();
  expect(window.location.pathname).toBe("/payment");
});

test("does not expose unused wallet, contact, or placeholder menu surfaces", async () => {
  window.history.pushState({}, "", "/payment");

  render(<App />);

  expect(await screen.findByText("Split collection")).toBeTruthy();
  expect(screen.queryByText("Wallet")).toBeNull();
  expect(screen.queryByText("Contact")).toBeNull();
  expect(screen.queryByText("Menu Content")).toBeNull();
  expect(screen.queryByText("This is the menu content.")).toBeNull();
});
