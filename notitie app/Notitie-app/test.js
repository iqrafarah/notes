window.addEventListener("load", (event) => {
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

  let btn = document.querySelector("#btn");
  let sidebar = document.querySelector(".sidebar");

  btn.onclick = function () {
    sidebar.classList.toggle("active");
  };

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

    const boldBtn = document.createElement("button");
    boldBtn.className = "bold";
    boldBtn.textContent = "B";
    boldBtn.onclick = function () {
      document.execCommand("bold", false, null);
    };

    const cursiveBtn = document.createElement("button");
    cursiveBtn.className = "italic";
    cursiveBtn.textContent = "I";
    cursiveBtn.onclick = function () {
      document.execCommand("italic", false, null);
    };

    const underlineBtn = document.createElement("button");
    underlineBtn.className = "underline";
    underlineBtn.textContent = "U";
    underlineBtn.onclick = function () {
      document.execCommand("underline", false, null);
    };
    styles.appendChild(boldBtn);
    styles.appendChild(cursiveBtn);
    styles.appendChild(underlineBtn);

    let remove = document.createElement("img");
    remove.className = "remove";
    remove.src = "src/imgs/trash.png";

    let sound = document.createElement("img");
    sound.className = "sound";
    sound.src = "src/imgs/volume-full-solid-240.png";

    let mic = document.createElement("img");
    mic.className = "mic";
    mic.src = "src/imgs/microphone.png";

    let box = document.createElement("div");
    box.className = "box";

    let divIcons = document.createElement("div");
    divIcons.className = "divIcons";

    let icons = document.createElement("div");
    icons.className = "icons";

    divIcons.appendChild(sound);
    divIcons.appendChild(mic);
    divIcons.appendChild(remove);

    icons.append(divIcons);
    array.push(inputBox.textContent);

    inputBox.addEventListener(
      "focus",
      () => {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        const hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        console.log();
        const formattedDateTime = `${day}-${month}-${year} ${hours}:${
          minutes < 10 ? "0" + minutes : minutes
        }`;
        icons.append(formattedDateTime);
        Intl.RelativeTimeFormat;
      },
      { once: true }
    );
    box.append(styles);
    box.appendChild(inputBox);
    box.append(icons);

    notesContainer.appendChild(box);

    getSound();
    getMic();

    sound.addEventListener("click", () => {
      updateStorage();
      let inputValue = inputBox.textContent;
      speech.text = inputValue;
      window.speechSynthesis.speak(speech);
    });
    standardMessage();
  });

  const buttonContainers = document.querySelectorAll(".styles button");

  buttonContainers.forEach((buttonContainer) => {
    buttonContainer.addEventListener("click", function (event) {
      const target = event.target;

      if (target.tagName === "BUTTON") {
        if (target.classList.contains("bold")) {
          document.execCommand("bold", false, null);
        } else if (target.classList.contains("italic")) {
          document.execCommand("italic", false, null);
        } else if (target.classList.contains("underline")) {
          document.execCommand("underline", false, null);
        }
        updateStorage();
      }
    });
  });

  // verwijderd de notitie
  notesContainer.addEventListener("click", function (e) {
    if (e.target.className === "remove") {
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
              <p class="input-box"contenteditable="true">${filter}</p>
                <div class="icons">
                  <img class="remove" src="src/imgs/trash.png">
                  <img class="sound" src="src/imgs/microphone.png">
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
    tabsStandard.innerHTML = `
        <h4><span class="tabItem plusIcon"><i class="fa-solid fa-plus white-icon"></i>   Create Tab</span></h4>
    `;
    DarkmodeToggle.innerHTML = `<i class="fa-regular fa-moon fa-xl" style="color: #fff"></i>`;
  } else {
    tabsStandard.innerHTML = `
        <h4><span class="tabItem plusIcon"><i class="fa-solid fa-plus black-icon"></i>   Create Tab</span></h4>
    `;
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
      tabsStandard.innerHTML = `
            <h4><span class="tabItem plusIcon"><i class="fa-solid fa-plus white-icon"></i>   Create Tab</span></h4>
        `;
      DarkmodeToggle.innerHTML = `<i class="fa-regular fa-moon fa-xl" style="color: #fff"></i>`;
    } else {
      tabsStandard.innerHTML = `
            <h4><span class="tabItem plusIcon"><i class="fa-solid fa-plus black-icon"></i>   Create Tab</span></h4>
        `;
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
