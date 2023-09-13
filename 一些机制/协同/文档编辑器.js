// demo 比较简单，还有关键的选区系统没处理，有时间我再处理一下
class Model {
  constructor() {
    this.text = "";
    this.lastIndex = 0;
  }

  apply(changeset) {
    changeset.forEach((op) => {
      if (op.retain) {
        this.lastIndex += op.retain;
      } else if (op.insert) {
        this.text =
          this.text.slice(0, this.lastIndex) +
          op.insert +
          this.text.slice(this.lastIndex);
      } else if (op.delete) {
        this.text =
          this.text.slice(0, this.lastIndex) +
          this.text.slice(this.lastIndex + op.delete);
        this.lastIndex -= op.delete;
      }
    });
    this.lastIndex = 0;
    this.changeCallback();
  }

  getText() {
    return this.text;
  }

  onChange(callback) {
    this.changeCallback = callback;
  }
}

class View {
  constructor(element) {
    this.element = element;
  }

  render(text) {
    this.element.innerHTML = text;
  }
}

class ChangeSet {
  constructor() {
    this.operations = [];
  }

  retain(length) {
    this.operations.push({
      retain: length
    });
    return this;
  }

  insert(text) {
    this.operations.push({
      insert: text
    });
    return this;
  }

  delete(length) {
    if (length > 0) {
      this.operations.push({
        delete: length
      });
    }
    return this;
  }

  forEach(callback) {
    this.operations.forEach(callback);
  }
}

class Editor {
  constructor(element) {
    this.view = new View(element);
    this.model = new Model();

    this.bindEvents(element);
  }

  bindEvents() {
    element.addEventListener("beforeinput", this.handleBeforeInput);
    this.model.onChange(this.handleModelChange);
  }

  handleBeforeInput = (e) => {
    e.preventDefault();

    const selection = window.getSelection();
    const start = Math.min(selection.focusOffset, selection.anchorOffset);
    const end = Math.max(selection.focusOffset, selection.anchorOffset);

    switch (e.inputType) {
      case "insertText":
        const change = new ChangeSet()
          .retain(start)
          .delete(end - start)
          .insert(e.data);
        this.model.apply(change);
        break;

      case "deleteContentBackward":
        // 光标
        if (start === end) {
          const change = new ChangeSet().retain(start - 1).delete(1);
          this.model.apply(change);
        } else {
          const change = new ChangeSet().retain(start).delete(end - start);
          this.model.apply(change);
        }
        break;
      default:
        break;
    }
  };

  handleModelChange = () => {
    console.log("model changed, content: ", this.model.getText());
    this.view.render(this.model.getText());
  };
}

const element = document.querySelector("#demo");
window.editor = new Editor(element);
