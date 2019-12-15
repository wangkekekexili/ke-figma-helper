function main() {
  function showDropdown() {
    const contentNode = document.createElement('div');
    contentNode.className = 'ke-figma-helper__dropdown-content';
    const frameNodes = [...figma.currentPage.children]
    frameNodes.sort((a, b) => a.y - b.y);
    for (const item of frameNodes) {
      if (item.__proto__.constructor.name !== 'FrameNode' || item.children.length === 0) {
        continue;
      }
      let str = '';
      const nodes = [...item.children];
      nodes.sort((a, b) => a.y - b.y);
      const textNodes = nodes.filter(n => n.__proto__.constructor.name === 'TextNode');
      if (textNodes.length / nodes.length < 0.7 && !item.name.endsWith('0') && item.width > 700) {
        continue;
      }
      for (const node of textNodes) {
        if (!node.visible) {
          continue;
        }
        if (str === '') {
          str = node.characters;
        } else {
          str += '<br>' + node.characters;
        }
      }
      if (str !== '') {
        var a = document.createElement('a');
        a.innerHTML = str;
        a.onclick = function () {
          figma.viewport.scrollAndZoomIntoView([item]);
        }
        contentNode.appendChild(a);
      }
    }

    const button = document.createElement('button');
    button.innerHTML = 'KE';
    button.className = 'ke-figma-helper__dropdown-button';
    button.onclick = function () {
      document.getElementsByClassName('ke-figma-helper__dropdown-content')[0].classList.toggle("ke-figma-helper__show");
    }

    // Remove existing dropdown.
    const dropdowns = document.getElementsByClassName('ke-figma-helper__dropdown');
    if (dropdowns.length === 1) {
      const d = dropdowns[0];
      d.parentNode.removeChild(d);
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'ke-figma-helper__dropdown';
    dropdown.appendChild(button);
    dropdown.appendChild(contentNode);

    const buttonGroup = document.getElementsByClassName('toolbar_view--buttonGroup--2wM3n')[0];
    buttonGroup.appendChild(dropdown);
  }

  function onButtonGroupReady() {
    const groups = document.getElementsByClassName('toolbar_view--buttonGroup--2wM3n');
    if (groups.length === 0) {
      setTimeout(onButtonGroupReady, 2500);
      return;
    }

    // Listen on page change.
    const pages = document.getElementsByClassName('pages_panel--pagesRowSpacer--3XD0S');
    for (const page of pages) {
      if (page.onclick === null) {
        page.onclick = onButtonGroupReady;
      }
    }

    setTimeout(showDropdown, 1000);
  }
  setTimeout(onButtonGroupReady, 2500);
}

const script = document.createElement('script');
script.appendChild(document.createTextNode('(' + main + ')();'));
const style = document.createElement('style');
style.innerHTML = `
.ke-figma-helper__dropdown-button {
  background-color: #3498DB;
  color: white;
  padding: 16px;
  font-size: 16px;
  border: none;
  cursor: pointer;
}

.ke-figma-helper__dropdown-button:hover, .ke-figma-helper__dropdown-button:focus {
  background-color: #2980B9;
}

.ke-figma-helper__dropdown {
  position: relative;
  display: inline-block;
}

.ke-figma-helper__dropdown-content {
  display: none;
  position: absolute;
  background-color: #f1f1f1;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
  overflow-y:auto;
  height: 600px;
}

.ke-figma-helper__dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.ke-figma-helper__dropdown-content a:hover {
  background-color: #ddd
}

.ke-figma-helper__show {
  display:block;
}
`;
(document.body || document.head || document.documentElement).appendChild(script);
(document.body || document.head || document.documentElement).appendChild(style);
