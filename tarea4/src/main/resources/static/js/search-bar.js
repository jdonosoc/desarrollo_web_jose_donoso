let searchForm = document.getElementById("search-form");
let inputSearch = document.getElementById("search-input");
let searchMessage = document.getElementById("search-message");
let resultsWrapper = document.getElementById("results-wrapper");
let resultsBody = document.getElementById("results-body");

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

let createHighlightedElement = (text, query) => {
  let fragment = document.createDocumentFragment();
  if (!query) {
    fragment.appendChild(document.createTextNode(text));
    return fragment;
  }

  let lowerText = text.toLowerCase();
  let lowerQuery = query.toLowerCase();
  let startIndex = 0;
  let matchIndex = lowerText.indexOf(lowerQuery, startIndex);

  while (matchIndex !== -1) {
    if (matchIndex > startIndex) {
      fragment.appendChild(
        document.createTextNode(text.slice(startIndex, matchIndex))
      );
    }

    let mark = document.createElement("mark");
    mark.className = "highlight";
    mark.textContent = text.slice(matchIndex, matchIndex + query.length);
    fragment.appendChild(mark);

    startIndex = matchIndex + query.length;
    matchIndex = lowerText.indexOf(lowerQuery, startIndex);
  }

  if (startIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(startIndex)));
  }

  return fragment;
};

let populateMatchList = (matchList, query) => {
  while (resultsBody.firstChild) {
    resultsBody.removeChild(resultsBody.firstChild);
  }

  if (query.trim() === "") {
    resultsWrapper.hidden = true;
    searchMessage.innerText = "Comienza a escribir para buscar avistamientos.";
    searchMessage.hidden = false;
    return;
  }

  if (matchList.length === 0) {
    resultsWrapper.hidden = true;
    searchMessage.innerText =
      "No se encontraron avistamientos que coincidan con la búsqueda.";
    searchMessage.hidden = false;
    return;
  }

  searchMessage.hidden = true;
  resultsWrapper.hidden = false;

  for (let avistamiento of matchList) {
    let row = document.createElement("tr");

    let voluntarioCell = document.createElement("td");
    voluntarioCell.appendChild(
      createHighlightedElement(avistamiento.nombre_voluntario, query)
    );

    let diaCell = document.createElement("td");
    diaCell.innerText = avistamiento.dia;

    let aveCell = document.createElement("td");
    aveCell.appendChild(
      createHighlightedElement(avistamiento.nombre_ave, query)
    );

    let comunaCell = document.createElement("td");
    comunaCell.appendChild(
      createHighlightedElement(avistamiento.nombre_comuna, query)
    );

    let notaCell = document.createElement("td");
    notaCell.className = "nota-cell";
    notaCell.innerText = avistamiento.nota;

    let actionCell = document.createElement("td");
    let evaluarBtn = document.createElement("button");
    evaluarBtn.type = "button";
    evaluarBtn.className = "btn-ver-info";
    evaluarBtn.innerText = "Evaluar";
    evaluarBtn.addEventListener("click", () => {
      openEvaluarModal(avistamiento, notaCell);
    });
    actionCell.appendChild(evaluarBtn);

    row.appendChild(voluntarioCell);
    row.appendChild(diaCell);
    row.appendChild(aveCell);
    row.appendChild(comunaCell);
    row.appendChild(notaCell);
    row.appendChild(actionCell);

    resultsBody.appendChild(row);
  }
};

let xhrAJAX = (url, query) => {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        let ajaxResponse = JSON.parse(xhr.responseText);
        populateMatchList(ajaxResponse["data"], query);
      } else {
        console.error("Error:", xhr.status, xhr.statusText);
      }
    }
  };
  xhr.send();
};

let fetchAJAX = (url, query) => {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((ajaxResponse) => {
      populateMatchList(ajaxResponse["data"], query);
    })
    .catch((error) => {
      console.error("There has been a problem with your fetch operation:", error);
    });
};

let ajaxMethod = "fetch";

let ajaxHandlerMapper = {
  xhr: xhrAJAX,
  fetch: fetchAJAX,
};

let handleAJAX = (event) => {
  let query = event.target.value;
  if (query.trim() === "") {
    populateMatchList([], "");
    return;
  }
  let ajaxHandler = ajaxHandlerMapper[ajaxMethod];
  let url = `${window.origin}/get-avistamientos?q=${encodeURIComponent(query.trim())}`;
  ajaxHandler(url, query.trim());
};

inputSearch.addEventListener("input", handleAJAX);
