document.addEventListener("DOMContentLoaded", function () {
  const addBtn = document.querySelector(".addNote");
  const notesContainer = document.querySelector(".notes-container");
  let notes = document.querySelectorAll(".input-box");
  let speech = new SpeechSynthesisUtterance();

  // toont de notities die bewaard zijn
  function showNotes() {
    const notesHTML = localStorage.getItem("notes");
    notesContainer.innerHTML = notesHTML;
    getSound();
    getMic();
  }
  showNotes();

  // bewaart de notities
  function updateStorage() {
    localStorage.setItem("notes", notesContainer.innerHTML);
  }

  notesContainer.addEventListener("input", function () {
    updateStorage();
    standardMessage();
  });
  function standardMessage() {
    const emptyMessage = document.querySelector(".empty-message");
    if (notesContainer.children.length === 0) {
      if (!emptyMessage) {
        const h1 = document.createElement("h1");
        h1.textContent = "No notes available";
        h1.className = "empty-message";
        notesContainer.appendChild(h1);
      }
    } else {
      if (emptyMessage) {
        emptyMessage.remove();
      }
    }
  }
  standardMessage();

  const sidebar = document.querySelector(".sidebar");
  const btn = document.querySelector("#btn");

  const isSidebarActive = localStorage.getItem("isSidebarActive") === "true";

  if (isSidebarActive) {
    sidebar.classList.add("active");
  }

  btn.onclick = function () {
    sidebar.classList.toggle("active");

    localStorage.setItem(
      "isSidebarActive",
      sidebar.classList.contains("active")
    );
  };

  const tabsContainer = document.querySelector(".tabsItems");
  const createTabButtons = document.querySelectorAll(".createTab");

  function createTab() {
    createTabButtons.forEach((createTabButton) => {
      createTabButton.addEventListener("click", () => {
        const tabName = "New tab";
        const tabKey = `tab-${Date.now()}`;
        const newTab = document.createElement("ul");
        newTab.setAttribute("data-tab", tabKey);

        newTab.innerHTML = `
			  <li class="liItems">
				<a href="#">
				  <i class='bx bxs-circle'></i>                 
				  <span class="tabItem nav-item item" contenteditable="false">${tabName}</span>
				</a> 
				<span class="tooltip tabItem">${tabName}</span>
				<i class='bx bxs-edit-alt tabIcons editTab'></i>            
				<i class="fa-solid fa-times deleteTab tabIcons"></i>
				
			  </li>
			`;

        newTab.addEventListener("click", function () {
          const tabKey = this.getAttribute("data-tab");
          showNotesWithKey(tabKey);
        });
        console.log("New tab created. Current tab key:", getCurrentTabKey());

        const tabContent = newTab.innerHTML;

        const tabData = { name: tabName, content: tabContent };
        newTab.setAttribute("data-tab", tabKey);
        tabsContainer.appendChild(newTab);
        localStorage.setItem(tabKey, JSON.stringify(tabData));
        console.log(tabKey);
      });
    });

    const activeTabKey = getCurrentTabKey(); // Implement the getCurrentTabKey function to get the active tab key
  }

  createTab();

  window.addEventListener("DOMContentLoaded", (event) => {
    const tabs = document.querySelectorAll("[data-tab]");
    tabs.forEach((tab) => {
      const tabKey = tab.getAttribute("data-tab");
      const tabData = localStorage.getItem(tabKey);
      if (tabData) {
        const { name, content } = JSON.parse(tabData);
        const tabNameElement = tab.querySelector(".tabItem");
        const tabContentElement = tab.querySelector(".tab-content");
        if (tabNameElement) {
          tabNameElement.textContent = name || "New tab";
          tabNameElement.contentEditable = false;
        }
        if (tabContentElement) {
          tabContentElement.innerHTML = "content";
        }
      }
    });
  });

  // save the edited tab name
  tabsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("editTab")) {
      console.log("edit tab clicked");
      const tab = event.target.closest("ul");
      const tabNameElement = tab.querySelector(".tabItem");

      tabNameElement.contentEditable = true;
      tabNameElement.focus();
      // tabNameElement.textContent = "";

      tabNameElement.addEventListener("blur", function () {
        const updatedTabName = tabNameElement.textContent;
        const tabKey = tab.getAttribute("data-tab");
        const tabContent = tab.innerHTML;
        const tabData = { name: updatedTabName, content: tabContent };
        localStorage.setItem(tabKey, JSON.stringify(tabData));

        const tooltip = tab.querySelector(".tooltip");
        if (tooltip) {
          tooltip.textContent = updatedTabName;
        }

        tabNameElement.contentEditable = false;
      });
    }
  });

  // delete tab
  tabsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("deleteTab")) {
      const tab = event.target.closest("ul");
      const tabKey = tab.getAttribute("data-tab");

      Swal.fire({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this tab!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          tab.remove();
          localStorage.removeItem(tabKey);
          Swal.fire("Deleted!", "Your tab has been deleted.", "success");
        }
      });
    }
  });

  // Loop through stored tab data and render tabs and notes
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("tab-")) {
      const storedTabData = JSON.parse(localStorage.getItem(key));
      const newTab = document.createElement("ul");
      newTab.setAttribute("data-tab", key);
      newTab.innerHTML = storedTabData.content;

      // Append the tab to the tabs container
      tabsContainer.appendChild(newTab);

      // Render notes within the corresponding tab based on data-tab attribute
      const notesInTab = newTab.querySelectorAll("[data-tab]");
      notesInTab.forEach((note) => {
        const noteTabKey = note.getAttribute("data-tab");
        if (noteTabKey === key) {
          // Append the note to the correct tab
          const activeTab = document.querySelector(`[data-tab="${key}"]`);
          activeTab.appendChild(note);
        }
      });
    }
  }

  function showNotesWithKey(tabKey) {
    const notesContainer = document.querySelector(".notesItems");
    notesContainer.innerHTML = "";

    const activeTabContent = JSON.parse(localStorage.getItem(tabKey));
    if (activeTabContent && activeTabContent.content) {
      notesContainer.innerHTML = activeTabContent.content;
    }
  }

  // tabsContainer.addEventListener("click", function (event) {
  //   if (event.target.classList.contains("tabItem")) {
  //     const tabKey = event.target.closest("ul").getAttribute("data-tab");
  //     localStorage.setItem("activeTabKey", tabKey);
  //     showNotesWithKey(tabKey);
  //     event.target.closest("ul").classList.add("active");
  //   }
  // });

  function getCurrentTabKey() {
    const activeTab = document.querySelector(".tabsItems .active");
    if (activeTab) {
      return activeTab.getAttribute("data-tab");
    }
    return null;
  }

  function getBoxValue(box) {
    return box.querySelector(".input-box").innerHTML;
  }

  // Log the data-tab values and content of the .box elements
  const allNotes = Array.from(notesContainer.querySelectorAll(".box"));

  // Log the data-tab values of the .tabItem elements
  const allTabs = Array.from(tabsContainer.querySelectorAll(".tabItem"));
  console.log(allTabs.map((tab) => tab.closest("ul").getAttribute("data-tab")));

  function showNotesWithKey(tabKey) {
    const allNotes = Array.from(document.querySelectorAll(".box"));
    const notesContainer = document.querySelector(".notes-container");

    allNotes.forEach((note) => {
      const noteTabKey = note.getAttribute("data-tab");

      const activeNote = note.querySelector(".input-box");
      const noteContent = getBoxValue(note);

      if (noteTabKey === tabKey) {
        if (noteContent.trim() !== "") {
          activeNote.innerHTML = noteContent;
          note.classList.remove("hidden"); // Remove the 'hidden' class to show the box
        } else {
          activeNote.innerHTML = "";
          note.classList.add("hidden"); // Add the 'hidden' class to hide the box
        }
      } else {
        note.classList.add("hidden"); // Add the 'hidden' class to hide the box
      }
    });

    // get tab name and display as h1 in notes container
    const tabName = document.querySelector(`[data-tab="${tabKey}"]`);
    const tabNameText = tabName.querySelector(".tabItem").textContent;
    const tabNameElement = document.createElement("h1");
    tabNameElement.className = "tabName";
    tabNameElement.textContent = tabNameText;

    // Remove previous tab name before adding new one
    const previousTabName = notesContainer.querySelector("h1");
    if (previousTabName) {
      previousTabName.remove();
    }

    notesContainer.append(tabNameElement);
    // tabnameElement should be first child of notesContainer
    notesContainer.insertBefore(tabNameElement, notesContainer.firstChild);
  }

  // Add event listener for tab clicks
  allTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabKey = tab.closest("ul").getAttribute("data-tab");
      showNotesWithKey(tabKey);
      localStorage.setItem("activeTabKey", tabKey); // Store active tab key
    });
  });

  const activeTabKey = localStorage.getItem("activeTabKey");
  if (activeTabKey) {
    const activeTab = document.querySelector(`[data-tab="${activeTabKey}"]`);
    if (activeTab) {
      activeTab.classList.add("active");
      showNotesWithKey(activeTabKey);
    }
  }

  // tabsContainer.addEventListener("click", function (event) {
  //   if (event.target.classList.contains("tabItem")) {
  //     const tabKey = event.target.closest("ul").getAttribute("data-tab");
  //     showNotesWithKey(tabKey);
  //   }
  // });

  function getCurrentTabKey() {
    const activeTab = document.querySelector(".tabItem.active");
    if (activeTab) {
      const tabKey = activeTab.closest("ul").getAttribute("data-tab");
      return tabKey;
    }
    // If no active tab is found, return the first tab as the default active tab
    const firstTab = document.querySelector(".tabItem");
    if (firstTab) {
      return firstTab.closest("ul").getAttribute("data-tab");
    }
    // If no tabs are available, return a default tab key
    return "default-tab-key";
  }

  const tabItems = document.querySelectorAll(".tabItem");
  tabsContainer.addEventListener("click", function (event) {
    if (event.target.classList.contains("tabItem")) {
      const allTabs = document.querySelectorAll(".tabItem");
      allTabs.forEach((tab) => {
        tab.classList.remove("active");
        tab.style.fontWeight = "normal"; // Reset font weight for all tabs
        console.log("Tab removed: ", tab);
      });

      event.target.classList.add("active");
      event.target.style.fontWeight = "bold"; // Apply bold style to the active tab

      const activeTabKey = getCurrentTabKey();
    }
  });

  // aanmaken van een notitie
  addBtn.addEventListener("click", () => {
    let inputBox = document.createElement("p");
    inputBox.setAttribute("contenteditable", "true");
    inputBox.textContent = "take note...";

    inputBox.addEventListener("focus", function () {
      if (this.textContent === "take note...") {
        this.textContent = "";
      }
    });

    inputBox.className = "input-box";

    let styles = document.createElement("div");
    styles.className = "styles";

    const boldBtn = createStyleButton("bold", "bx-bold");
    const italicBtn = createStyleButton("italic", "bx-italic");
    const underlineBtn = createStyleButton("underline", "bx-underline");
    const strikethroughBtn = createStyleButton(
      "strikeThrough",
      "bx-strikethrough"
    );
    const todoBtn = createStyleButton(
      "insertHTML",
      "bx-check-square",
      '<input class="checkbox" type="checkbox"> '
    );

    function createStyleButton(command, iconClass, commandValue = null) {
      const button = document.createElement("button");
      button.className = command;
      const icon = document.createElement("i");
      icon.className = `bx ${iconClass} fa-lg`;
      button.appendChild(icon);

      button.onclick = function () {
        document.execCommand(command, false, commandValue);
      };

      return button;
    }

    // Append style buttons to the styles div
    styles.appendChild(boldBtn);
    styles.appendChild(italicBtn);
    styles.appendChild(underlineBtn);
    styles.appendChild(strikethroughBtn);
    styles.appendChild(todoBtn);

    const remove = document.createElement("i");
    remove.className = "bx bx-trash bx-sm remove";

    let sound = document.createElement("i");
    sound.className = "bx bx-volume-full bx-sm sound";

    let mic = document.createElement("i");
    mic.className = "bx bxs-microphone bx-sm mic";

    let box = document.createElement("div");
    box.className = "box";
    box.setAttribute("data-tab", getCurrentTabKey());

    let divIcons = document.createElement("div");
    divIcons.className = "divIcons";

    let icons = document.createElement("div");
    icons.className = "icons";

    divIcons.appendChild(sound);
    divIcons.appendChild(mic);
    divIcons.appendChild(remove);

    icons.append(divIcons);
    array.push(inputBox.textContent);

    let lastUpdateTime = null;

    const updateDateTime = () => {
      const currentDate = new Date();
      const timeDifference = Math.floor((currentDate - lastUpdateTime) / 1000); // Time difference in seconds

      let formattedDateTime = "";

      if (timeDifference < 60) {
        formattedDateTime = "just now";
      } else if (timeDifference < 3600) {
        const minutes = Math.floor(timeDifference / 60);
        formattedDateTime = `${minutes}m ago`;
      } else if (timeDifference < 86400) {
        const hours = Math.floor(timeDifference / 3600);
        formattedDateTime = `${hours}h ago`;
      } else {
        const days = Math.floor(timeDifference / 86400);
        formattedDateTime = `${days}d ago`;
      }

      const lastChild = icons.lastChild;
      if (
        lastChild.nodeType === Node.TEXT_NODE &&
        lastChild.textContent === formattedDateTime
      ) {
        return;
      }

      const dateTimeNode = document.createTextNode(formattedDateTime);
      icons.append(dateTimeNode);
    };

    inputBox.addEventListener("input", () => {
      lastUpdateTime = new Date();
      updateDateTime();
    });

    box.append(styles);
    box.appendChild(inputBox);
    box.append(icons);

    notesContainer.insertBefore(box, notesContainer.firstChild);
    // notesContainer.appendChild(box);

    getSound();
    getMic();

    let selectColorOption = document.createElement("input");
    selectColorOption.type = "text";
    selectColorOption.className = "jscolor";
    selectColorOption.value = "FFFFFF";
    let colorPicker = new jscolor(selectColorOption);

    styles.append(selectColorOption);

    selectColorOption.addEventListener("input", function () {
      console.log("Color changed:", this.value);
      box.style.backgroundColor = this.value;

      let isDarkColor = isColorDark(this.value);
      box.style.color = isDarkColor ? "white" : "black";

      function isColorDark(hexColor) {
        let r = parseInt(hexColor.slice(1, 3), 16);
        let g = parseInt(hexColor.slice(3, 5), 16);
        let b = parseInt(hexColor.slice(5, 7), 16);

        let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance < 0.5;
      }
      box.style.color = isDarkColor ? "white" : "black";

      let icons = box.querySelectorAll(".icons img");
      icons.forEach((icon) => {
        icon.style.filter = isDarkColor ? "invert(1)" : "invert(0)";
      });
    });

    sound.addEventListener("click", () => {
      updateStorage();
      let inputValue = inputBox.textContent;
      speech.text = inputValue;
      window.speechSynthesis.speak(speech);
    });
    standardMessage();
  });

  const styleButtons = document.querySelectorAll(".styles button");

  styleButtons.forEach((styleButton) => {
    styleButton.addEventListener("click", function (event) {
      const command = styleButton.classList[0]; // Get the command from the button's class name
      console.log(command);
      let commandValue = null;

      if (command === "todo") {
        commandValue = '<input class="checkbox" type="checkbox"> ';
      }

      if (
        command === "bold" ||
        command === "italic" ||
        command === "underline" ||
        command === "strikethrough"
      ) {
        document.execCommand(command, false, null);
      } else {
        document.execCommand(command, false, commandValue); // Execute the command
      }

      updateStorage(); // Update the storage after applying the formatting

      // event.preventDefault(); // Prevent the button from performing default browser behavior (e.g., form submission)
    });
  });

  // verwijderd de notitie
  notesContainer.addEventListener("click", function (e) {
    if (event.target.classList.contains("remove")) {
      Swal.fire({
        title: "Are you sure?",
        text: "Once deleted, you will not be able to recover this note!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          const deletedNote = e.target.parentNode.parentNode.parentNode;
          const deletedNoteText =
            deletedNote.querySelector(".input-box").textContent;
          saveDeletedNoteToStorage(deletedNoteText);

          deletedNote.remove();

          e.target.parentNode.parentNode.remove();

          updateStorage();
          array = Array.from(
            notesContainer.querySelectorAll(".input-box"),
            (inputBox) => inputBox.innerHTML
          );
          standardMessage();
          Swal.fire("Deleted!", "Your note has been deleted.", "success");
        }
      });
      standardMessage();
    } else if (e.target.tagName === "P") {
      notes = document.querySelectorAll(".box");
      notes.forEach((nt) => {
        nt.onkeyup = function () {
          updateStorage();
          let inputBox = nt.querySelector(".input-box");
          updateSpeechText(inputBox);
          array = Array.from(
            notesContainer.querySelectorAll(".input-box"),
            (inputBox) => inputBox.innerHTML
          );
        };
      });
    }
  });

  function saveDeletedNoteToStorage(deletedNoteText) {
    let deletedNotes = JSON.parse(localStorage.getItem("deletedNotes")) || [];
    deletedNotes.push(deletedNoteText);
    localStorage.setItem("deletedNotes", JSON.stringify(deletedNotes));
  }

  // als je op enter klikt krijg je een regeleinde
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      updateStorage();
      document.execCommand("insertLineBreak");
      event.preventDefault();
    }
  });

  // zorgt voor de speech
  function updateSpeechText(inputBox) {
    let inputValue = inputBox.textContent;
    speech.text = inputValue;
  }

  function getSound() {
    let sounds = document.querySelectorAll(".sound");
    sounds.forEach((sound) => {
      sound.addEventListener("click", () => {
        let inputBox = sound.closest(".box").querySelector(".input-box");

        if (inputBox) {
          updateSpeechText(inputBox);
          window.speechSynthesis.speak(speech);
        }
      });
    });
  }

  // mic function
  function getMic() {
    let mics = document.querySelectorAll(".mic");
    mics.forEach((mic) => {
      mic.addEventListener("click", () => {
        const recognition = new webkitSpeechRecognition();
        recognition.start();

        recognition.onresult = function (event) {
          const result = event.results[0][0].transcript;

          const activeInputBox = mic
            .closest(".box")
            .querySelector(".input-box");
          if (activeInputBox) {
            if (activeInputBox.textContent.trim() === "take note...") {
              activeInputBox.textContent = "";
            }
          }
          if (activeInputBox) {
            activeInputBox.innerHTML += `\n` + result;
            updateStorage();

            array = Array.from(
              notesContainer.querySelectorAll(".input-box"),
              (inputBox) => inputBox.innerHTML
            );
          }
        };

        recognition.onerror = function (event) {
          console.error("Speech Recognition Error: ", event.error);
        };
      });
    });
  }
  getMic();

  // haalt de inputbox data op en stop het in een array
  let inputBoxs = document.querySelectorAll(".input-box");
  let array = [];

  inputBoxs.forEach((inputBox) => {
    array.push(inputBox.innerHTML);
  });

  // search functie
  const searchTerm = document.getElementById("searchBar");

  searchTerm.addEventListener("click", () => {
    searchTerm.addEventListener("keyup", function (event) {
      event.preventDefault();
      if (searchTerm.value != "") {
        const searchString = event.target.value.toLowerCase();
        if (searchString != "") {
          const searchFiltered = array.filter((item) => {
            return item.toLowerCase().includes(searchString);
          });
          notesContainer.innerHTML = "";
          if (searchFiltered != "") {
            searchFiltered.forEach((filter) => {
              notesContainer.innerHTML += `
			  <div class="box">
				  <div class="styles">
				  <button class="bold">
				  <i class="bx bx-bold fa-lg"></i>
				  </button><button class="italic">
				  <i class="bx bx-italic fa-lg"></i>
				  </button><button class="underline">
				  <i class="bx bx-underline fa-lg"></i>
				  </button><button class="strikeThrough">
				  <i class="bx bx-strikethrough fa-lg"></i>
				  </button><button class="insertHTML">
				  <i class="bx bx-check-square fa-lg"></i>
				  
				  </div>
				  <p class="input-box"contenteditable="false">${filter}</p>
				   <div class="icons">
				   <div class="divIcons">
				   <i class="bx bx-volume-full fa-lg "></i>
				   <i class="bx bxs-microphone fa-lg "></i>
				   <i class="bx bx-trash fa-lg "></i>
				   </div>
				   </div>
			  </div>
		`;
            });
          } else {
            notesContainer.innerHTML += `
				<p>Geen resultaat</p>
				`;
          }
        }
      } else {
        showNotes();
      }
    });
  });

  // Darkmode
  let isdarkmode;
  const DarkmodeToggle = document.querySelector(".darkmode-btn");
  const tabsStandard = document.querySelector(".tabsStandard");
  const isDarkModeEnabled = localStorage.getItem("darkMode") === "enabled";

  if (isDarkModeEnabled) {
    DarkmodeToggle.innerHTML = `<i class="fa-regular fa-moon fa-xl" style="color: #fff"></i>`;
  } else {
    DarkmodeToggle.innerHTML = `<i class="fa-solid fa-moon fa-xl" style="color: #fff"></i>`;
  }

  isdarkmode = !isdarkmode;

  DarkmodeToggle.addEventListener("click", () => {
    const body = document.body;
    document.body.classList.toggle("darkMode");

    document.querySelector("header").classList.toggle("darkHeader");
    document.querySelector("#searchBar").classList.toggle("darkSearchBar");
    document.querySelector(".div1").classList.toggle("darkTabs");

    const isDarkModeEnabled = document.body.classList.contains("darkMode");
    localStorage.setItem(
      "darkMode",
      isDarkModeEnabled ? "enabled" : "disabled"
    );

    if (isDarkModeEnabled) {
      DarkmodeToggle.innerHTML = `<i class="fa-regular fa-moon fa-xl" style="color: #fff"></i>`;
    } else {
      DarkmodeToggle.innerHTML = `<i class="fa-solid fa-moon fa-xl" style="color: #fff"></i>`;
    }
  });

  if (localStorage.getItem("darkMode") == "enabled") {
    const body = document.body;
    body.classList.toggle("darkMode");
    document.querySelector("header").classList.toggle("darkHeader");
    document.querySelector("#searchBar").classList.toggle("darkSearchBar");
    document.querySelector(".div1").classList.toggle("darkTabs");
  }
});
