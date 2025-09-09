// online-code-editor/app.js
// Author: Ajith (ajcj7)
// Professional refactor applying SOLID principles

// Class representing a single code editor section (HTML, CSS, JS)
class CodePanel {
  constructor(type, textareaId, clearBtnId, copyBtnId) {
    this.type = type;
    this.textarea = document.getElementById(textareaId);
    this.clearBtn = document.querySelector(clearBtnId);
    this.copyBtn = document.querySelector(copyBtnId);

    // Single Responsibility: Only panel-specific logic here
    this.clearBtn.addEventListener('click', () => this.clear());
    this.copyBtn.addEventListener('click', () => this.copyCode());
  }

  get value() {
    return this.textarea.value;
  }

  set value(val) {
    this.textarea.value = val;
  }

  clear() {
    this.value = '';
    localStorage.setItem(`livecode-${this.type}`, '');
    CodeEditorManager.instance.compile();
  }

  copyCode() {
    this.textarea.select();
    document.execCommand('copy');
    this.showCopied();
  }

  showCopied() {
    this.copyBtn.innerText = 'Copied!';
    setTimeout(() => (this.copyBtn.innerText = 'Copy'), 800);
  }
}

// Single Responsibility, Dependency Inversion: 
// CodeEditorManager only manages app flow, not UI details
class CodeEditorManager {
  static instance = null;

  constructor(panels, outputFrameId) {
    this.panels = panels;
    this.outputFrame = document.getElementById(outputFrameId).contentWindow.document;
    CodeEditorManager.instance = this;

    this.registerEvents();
    this.setInitial();
    this.compile();
  }

  registerEvents() {
    // All code panels trigger compile on any keyup
    document.body.addEventListener('keyup', () => this.compile());
  }

  setInitial() {
    this.panels.forEach(panel => {
      panel.value =
        localStorage.getItem(`livecode-${panel.type}`) ||
        this.getDefault(panel.type);
    });
    this.compile();
  }

  getDefault(type) {
    switch (type) {
      case 'html':
        return `<h1>Welcome to the Live Code Editor!</h1>`;
      case 'css':
        return `body { background: #222; color: #fff; } h1 { text-align: center; margin-top: 10%; }`;
      case 'js':
      default:
        return '';
    }
  }

  compile() {
    // Save all contents before compiling
    this.panels.forEach(panel =>
      localStorage.setItem(`livecode-${panel.type}`, panel.value)
    );

    this.outputFrame.open();
    this.outputFrame.writeln(
      `${this.panels[0].value}<style>${this.panels[1].value}</style><script>${this.panels[2].value}<\/script>`
    );
    this.outputFrame.close();
  }
}

// Usage: create panels and pass to manager (Liskov Substitution: Panels can be swapped)
const htmlPanel = new CodePanel('html', 'html', '.clear-html', '.copy-html');
const cssPanel = new CodePanel('css', 'css', '.clear-css', '.copy-css');
const jsPanel = new CodePanel('js', 'js', '.clear-js', '.copy-js');
const manager = new CodeEditorManager([htmlPanel, cssPanel, jsPanel], 'output');
