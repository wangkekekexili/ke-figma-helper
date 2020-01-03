function main() {
  function showDropdown() {
    // contentNode contains the dropdown div.
    const contentNode = document.createElement('div');
    contentNode.className = 'ke-figma-helper__dropdown-content';

    // Add a section that can go to a specific node by ID.
    const goToNodeDiv = document.createElement('div');
    goToNodeDiv.className = 'ke-figma-helper__dropdown-content__go-to-node';
    contentNode.appendChild(goToNodeDiv);

    const goToNodeInput = document.createElement('input');
    goToNodeInput.className = 'ke-figma-helper__dropdown-content__go-to-node__input';
    goToNodeInput.placeholder = 'Node ID';
    goToNodeDiv.appendChild(goToNodeInput);

    const goToNodeButton = document.createElement('button');
    goToNodeButton.className = 'ke-figma-helper__dropdown-content__go-to-node__button';
    goToNodeButton.innerText = 'GO';
    goToNodeDiv.appendChild(goToNodeButton);
    goToNodeButton.onclick = function() {
      let nodeID = goToNodeInput.value;
      nodeID = nodeID.replace('%3A', ':');

      let found = false;
      let pageForNode = null;
      let frameForNode = null;
      for (const page of figma.root.children) {
        if (found) {
          break;
        }
        for (const frame of page.children) {
          if (frame.id === nodeID) {
            found = true;
            pageForNode = page;
            frameForNode = frame;
            break;
          }
        }
      }

      if (found) {
        const currentPage = figma.currentPage;
        figma.currentPage = pageForNode;
        figma.viewport.scrollAndZoomIntoView([frameForNode]);
        if (figma.currentPage !== currentPage) {
          showDropdown();
        }
      }
    };

    const frameNodes = [...figma.currentPage.children]
    frameNodes.sort((a, b) => a.y - b.y);
    for (const item of frameNodes) {
      if (item.__proto__.constructor.name !== 'FrameNode' || item.children.length === 0) {
        continue;
      }

      const textNodes = [...item.children.filter(n => n.__proto__.constructor.name === 'TextNode')];
      textNodes.sort((a, b) => a.y - b.y);
      // https://www.figma.com/file/cHX3MFFKp87mAGU735Z6X0/File-Template?node-id=155%3A41
      if (item.width !== 512 || item.height !== 768 || textNodes.length < 3) {
        continue;
      }

      let titleIndex = -1;
      for (let i = 0; i !== textNodes.length; i++) {
        if (textNodes[i].name === 'Title') {
          titleIndex = i;
          break;
        }
      }
      if (titleIndex === -1) {
        continue;
      }
      const titlePElement = document.createElement('p');
      titlePElement.innerText = textNodes[titleIndex].characters;

      a = document.createElement('a');
      a.appendChild(titlePElement);
      a.onclick = function () {
        figma.viewport.scrollAndZoomIntoView([item]);
      }
      contentNode.appendChild(a);

      if (titleIndex < textNodes.length - 1 && textNodes[titleIndex + 1].name === 'Description') {
        const descriptionPElement = document.createElement('p');
        descriptionPElement.style.fontSize = '85%';
        descriptionPElement.innerText = textNodes[titleIndex + 1].characters;
        a.appendChild(descriptionPElement);
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

    setTimeout(showDropdown, 100);
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
  height: 40px;
  width: 40px;
  font-size: 14px;
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
  padding: 8px 8px;
  text-decoration: none;
  display: block;
}

.ke-figma-helper__dropdown-content a:hover {
  background-color: #ddd
}

.ke-figma-helper__show {
  display:block;
}

.ke-figma-helper__dropdown-content__go-to-node {
  display: flex;
}

.ke-figma-helper__dropdown-content__go-to-node__input {
  padding-left: 16px;
  padding-right: 16px;
  flex-grow: 1;
}

.ke-figma-helper__dropdown-content__go-to-node__button {
  flex-grow: 1;
  background-color: #ddd;
  min-width: 32px;
}
`;
(document.body || document.head || document.documentElement).appendChild(script);
(document.body || document.head || document.documentElement).appendChild(style);
