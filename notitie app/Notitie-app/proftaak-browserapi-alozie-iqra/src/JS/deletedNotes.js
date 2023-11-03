window.addEventListener("load", (event) => {
  const deletedNotesContainer = document.querySelector(".deletedNotes");
  let deletedNotes = JSON.parse(localStorage.getItem("deletedNotes")) || [];
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
              <span class="tabItem nav-item item" contenteditable="true">${tabName}</span>
            </a> 
            <span class="tooltip tabItem">${tabName}</span>
            <i class="fa-solid fa-times deleteTab"></i>
          </li>
        `;

        const tabContent = newTab.innerHTML;
        const tabData = { name: tabName, content: tabContent };
        newTab.setAttribute("data-tab", tabKey);
        tabsContainer.appendChild(newTab);
        localStorage.setItem(tabKey, JSON.stringify(tabData));
        console.log(tabKey);
      });
    });
  }

  createTab();

  // save the edited tab name
  tabsContainer.addEventListener("keyup", function (event) {
    if (event.target.classList.contains("tabItem")) {
      const tab = event.target.closest("ul");
      const tabKey = tab.getAttribute("data-tab");
      const tabName = event.target.textContent;
      const tabContent = tab.innerHTML;
      const tabData = { name: tabName, content: tabContent };
      localStorage.setItem(tabKey, JSON.stringify(tabData));

      const tooltip = tab.querySelector(".tooltip");
      if (tooltip) {
        tooltip.textContent = tabName;
      }
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

  // Retrieve tab data from local storage and recreate tabs
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("tab-")) {
      const storedTabData = JSON.parse(localStorage.getItem(key));
      const newTab = document.createElement("ul");
      newTab.innerHTML = storedTabData.content;
      newTab.setAttribute("data-tab", key);
      if (!document.querySelector(`[data-tab="${key}"]`)) {
        tabsContainer.appendChild(newTab);
      }
    }
  }

  function showNotes() {
    deletedNotesContainer.innerHTML = "";
    deletedNotes.reverse().forEach((note) => {
      deletedNotesContainer.innerHTML += `
        <div class="box" data-index="${deletedNotes.indexOf(note)}">
          <div class="styles">
            <button class="bold" onClick="document.execCommand(
              "bold",
              false,
              null
            )">b</button>
            <button class="italic" onClick="document.execCommand(
              "italic",
              false,
              null
            )">i</button>
            <button class="underline" onClick="document.execCommand(
              "underline",
              false,
              null
            )">u</button>
          </div>
          <p class="input-box" contenteditable="false">${note}</p>
          <div class="icons">
            <img class="remove" src="imgs/trash.png">
          </div>
        </div>
      `;
      standardMessage();
    });
  }
  showNotes();

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

  function standardMessage() {
    const emptyMessage = document.querySelector(".empty-message");
    if (deletedNotesContainer.children.length === 0) {
      if (!emptyMessage) {
        const h1 = document.createElement("h1");
        h1.textContent = "No deleted notes available";
        h1.className = "empty-message";
        deletedNotesContainer.appendChild(h1);
      }
    } else {
      if (emptyMessage) {
        emptyMessage.remove();
      }
    }
  }
  standardMessage();

  deletedNotesContainer.addEventListener("click", function (e) {
    if (e.target.className === "remove") {
      const response = confirm(
        "Are you sure that you want to delete this note Permanently?"
      );
      if (response) {
        const noteIndex = Array.from(
          deletedNotesContainer.querySelectorAll(".box")
        ).indexOf(e.target.parentNode.parentNode);

        deletedNotes.splice(noteIndex, 1);
        updateStorage();
        showNotes();
      }
    }
    standardMessage();
  });
  // Function to update local storage
  function updateStorage() {
    localStorage.setItem("deletedNotes", JSON.stringify(deletedNotes));
  }
  let isdarkmode;
  const DarkmodeToggle = document.querySelector(".darkmode-btn");
  DarkmodeToggle.addEventListener("click", () => {
    const body = document.body;
    body.classList.toggle("darkMode");

    document.querySelector("header").classList.toggle("darkHeader");
    document.querySelector("#searchBar").classList.toggle("darkSearchBar");
    document.querySelector(".div1").classList.toggle("darkTabs");

    if (isdarkmode) {
      DarkmodeToggle.innerHTML = "";
      DarkmodeToggle.innerHTML += `<i class="fa-solid fa-moon fa-xl" style="color: #fff"></i>
      `;
    } else {
      DarkmodeToggle.innerHTML = "";
      DarkmodeToggle.innerHTML += `
        <i class="fa-regular fa-moon fa-xl" style="color: #fff"></i>
      `;
    }
    isdarkmode = !isdarkmode;

    if (document.body.classList.contains("darkMode")) {
      localStorage.setItem("darkMode", "enabled");
    } else {
      localStorage.setItem("darkMode", "disabled");
    }
  });

  // search
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
          deletedNotesContainer.innerHTML = "";
          if (searchFiltered != "") {
            searchFiltered.forEach((filter) => {
              deletedNotesContainer.innerHTML += `
          <div class="box">
              <div class="styles">
                  <button class="bold" onClick="document.execCommand(
                    "bold",
                    false,
                    null
                  )">b</button>
                  <button class="italic" onClick="document.execCommand(
                    "italic",
                    false,
                    null
                  )">i</button>
                  <button class="underline" onClick="document.execCommand(
                    "underline",
                    false,
                    null
                  )">u</button>
              </div>
              <p class="input-box"contenteditable="false">${filter}</p>
                <div class="icons">
                  <img class="remove" src="imgs/trash.png">

                </div>
          </div>
    `;
            });
          } else {
            deletedNotesContainer.innerHTML += `
            <p>Geen resultaat</p>
            `;
          }
        }
      } else {
        showNotes();
      }
    });
  });

  //darkmode
  if (localStorage.getItem("darkMode") == "enabled") {
    const body = document.body;
    body.classList.toggle("darkMode");
    document.querySelector("header").classList.toggle("darkHeader");
    document.querySelector("#searchBar").classList.toggle("darkSearchBar");
    document.querySelector(".div1").classList.toggle("darkTabs");
  }

  let inputBoxs = document.querySelectorAll(".input-box");
  let array = [];

  inputBoxs.forEach((inputBox) => {
    array.push(inputBox.innerHTML);
  });
});
