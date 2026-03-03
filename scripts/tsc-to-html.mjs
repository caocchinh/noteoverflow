#!/usr/bin/env node
import Convert from "ansi-to-html";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const convert = new Convert({
  fg: "#333",
  bg: "#f5f5f5",
  newline: true,
  escapeXML: true,
  stream: false,
});

try {
  execSync("tsc --noEmit ", {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  });

  generateHTML("No TypeScript errors found! ✅", true);
} catch (error) {
  // TSC returns non-zero exit code when there are errors
  const output = error.stdout || error.stderr || error.message;
  generateHTML(output, false);
}

function generateHTML(content, success) {
  const htmlContent = convert.toHtml(content);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TypeScript Type Check Results</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .header {
      background: ${success ? "#10b981" : "#ef4444"};
      color: white;
      padding: 20px 30px;
      border-bottom: 3px solid ${success ? "#059669" : "#dc2626"};
    }
    
    .header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .header p {
      opacity: 0.9;
      font-size: 14px;
    }
    
    .content {
      padding: 30px;
    }
    
    .output {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 20px;
      border-radius: 6px;
      overflow-x: auto;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.5;
    }
    
    .success-message {
      color: #10b981;
      font-size: 18px;
      font-weight: 500;
      text-align: center;
      padding: 40px;
    }
    
    .timestamp {
      text-align: right;
      color: #666;
      font-size: 12px;
      margin-top: 20px;
      padding: 0 30px 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TypeScript Type Check Results</h1>
      <p>${success ? "All type checks passed successfully" : "Type checking completed with errors"}</p>
    </div>
    <div class="content">
      ${
        success
          ? `<div class="success-message">${htmlContent}</div>`
          : `<div class="output">${htmlContent}</div>`
      }
    </div>
    <div class="timestamp">
      Generated: ${new Date().toLocaleString()}
    </div>
  </div>
</body>
</html>`;

  const outputPath = path.join(process.cwd(), "debug", "type-check.html");

  // Ensure debug directory exists
  const debugDir = path.dirname(outputPath);
  if (!fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, html, "utf-8");
  console.log(`TypeScript HTML report generated: ${outputPath}`);
}
