const terminalOutput = document.getElementById("output");
const inputField = document.getElementById("input-field");

class Shape {
  constructor() {
    this.color = "black";
  }
  setColor(color) {
    this.color = color;
  }
}

class Circle extends Shape {
  render() {
    return `<circle cx="150" cy="100" r="80" fill="${this.color}" />`;
  }
}

class Square extends Shape {
  render() {
    return `<rect x="100" y="50" width="100" height="100" fill="${this.color}" />`;
  }
}

class Triangle extends Shape {
  render() {
    return `<polygon points="150,20 280,180 20,180" fill="${this.color}" />`;
  }
}

const commandState = {
  text: "",
  textColor: "black",
  shape: "",
  shapeColor: "black",
};

const prompts = [
  { command: "text", prompt: "Enter logo text (max 3 characters):" },
  { command: "text-color", prompt: "Enter text color (e.g., red or #ff0000):" },
  { command: "shape", prompt: "Enter shape (circle, square, triangle):" },
  { command: "shape-color", prompt: "Enter shape color (e.g., blue or #0000ff):" },
  { command: "generate", prompt: "Type 'generate' to create your SVG logo!" },
];

let currentPromptIndex = 0;

const commands = {
  text: (args) => {
    if (args[0] && args[0].length <= 3) {
      commandState.text = args[0];
      return `Text set to "${args[0]}"`;
    }
    return "Error: Text must be 3 characters or fewer.";
  },
  "text-color": (args) => {
    commandState.textColor = args[0] || "black";
    return `Text color set to "${args[0]}"`;
  },
  shape: (args) => {
    if (["circle", "square", "triangle"].includes(args[0]?.toLowerCase())) {
      commandState.shape = args[0].toLowerCase();
      return `Shape set to "${args[0]}"`;
    }
    return "Error: Invalid shape. Choose 'circle', 'square', or 'triangle'.";
  },
  "shape-color": (args) => {
    commandState.shapeColor = args[0] || "black";
    return `Shape color set to "${args[0]}"`;
  },
  generate: () => {
    if (!commandState.text || !commandState.shape || !commandState.shapeColor) {
      return "Error: Missing required fields. Complete all prompts first.";
    }

    const shape = (() => {
      switch (commandState.shape) {
        case "circle":
          return new Circle();
        case "square":
          return new Square();
        case "triangle":
          return new Triangle();
        default:
          return null;
      }
    })();

    if (!shape) return "Error: Invalid shape.";

    shape.setColor(commandState.shapeColor);
    const svg = `
      <svg version="1.1" width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        ${shape.render()}
        <text x="150" y="120" font-size="60" text-anchor="middle" fill="${commandState.textColor}">
          ${commandState.text}
        </text>
      </svg>
    `;

    terminalOutput.innerHTML += "\n" + svg;
    generateDownloadLink(svg);
    return "SVG Logo generated! Check the above output.";
  },
};

function generateDownloadLink(svgContent) {
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  let downloadLink = document.getElementById("download-link");
  if (!downloadLink) {
    downloadLink = document.createElement("a");
    downloadLink.id = "download-link";
    downloadLink.textContent = "Download Logo";
    downloadLink.className = "btn visible";
    downloadLink.style.display = "block";
    document.body.appendChild(downloadLink);
  }

  downloadLink.href = url;
  downloadLink.download = "logo.svg";
  downloadLink.classList.add("visible");
}

inputField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const input = inputField.value.trim();
    inputField.value = "";

    if (!input) return;

    const currentCommand = prompts[currentPromptIndex].command;
    const args = input.split(" ");
    const output = commands[currentCommand]?.(args) || `Error: Unknown command "${currentCommand}"`;

    terminalOutput.innerHTML += `\n$ ${input}\n${output}`;
    terminalOutput.scrollTop = terminalOutput.scrollHeight;

    if (!output.startsWith("Error")) {
      currentPromptIndex++;
      if (currentPromptIndex < prompts.length) {
        inputField.placeholder = prompts[currentPromptIndex].prompt;
      } else {
        inputField.placeholder = "Command complete! You can restart or edit your inputs.";
      }
    }
  }
});

inputField.placeholder = prompts[currentPromptIndex].prompt;
