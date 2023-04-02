import { fromEvent, BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";

async function callFetchQuery(query) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        message: "animevostSearch",
        query,
      },
      (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      }
    );
  });
}

async function callFetchEpisodes(data, url) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        message: "getepisodes",
        url,
        data,
      },
      (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      }
    );
  });
}
async function callFetchLast() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        message: "animevostLast",
      },
      (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response);
        }
      }
    );
  });
}



function createCard(title, image, id) {
  const card = document.createElement("div");
  card.innerHTML = `
  <div
  
  data-w2g="['visible', 'if'], ['$parent.dragStart', ['event', 'dragstart', null, false]], ['$parent.dragOver', ['event', 'dragover']], ['$parent.dragEnter', ['event', 'dragenter']], ['$parent.dragDrop', ['event', 'drop']], ['active', ['css', ['w2g-item-active', null]]], ['dragover', ['css', ['dragover', null]]], ['vote_count', ['style', 'order']], ['draggable', ['attr', 'draggable']]" class="darker-item mod_pl_drag rounded-md w2g-list-item" draggable="true" style="order: 0;">
  <div data-animevost-id="${id}" class="mod-player w2g-list-item-image" title="Воспроизвести"> <img data-w2g="['$parent.playClick', ['event', 'click']], ['thumb', ['attr', 'src']]" src="${image}" alt="Предпросмотр" draggable="false"> </div>
  <div data-animevost-id="${id}" class="flex items-center" data-w2g="['$parent.shuffle', ['render', 2]]" style="display: none;"></div>
  <div class="w2g-list-item-title">
     <div data-animevost-id="${id}" class="hover:underline leading-tight line-clamp-2 mod-player text-xs" data-w2g="['$parent.playClick', ['event', 'click']], ['title', 'text'], ['edit', 'ifnot']" title="Воспроизвести">${title}</div>
     <div data-w2g="['edit', 'render']" class="w2g-inline-edit" style="display: none;"></div>
  </div>
</div> `;
  return card;
}

function addCardsToPage(cards) {
  const container = document.querySelector(".animevost-cards");
  container.innerHTML = `<div data-w2g="['items', 'each']" class="animevost-cards w2g-items w2g-list-items w2g-scroll-vertical" style="display: block;">  </div>`;
  cards.forEach((card) => {
    container.appendChild(card);
  });
}

function init() {
  const myState = new useState(0);
  var beh = new BehaviorSubject();

  const searchInput = document.createElement("input");
  searchInput.setAttribute("type", "search");
  searchInput.setAttribute(
    "placeholder",
    "Search or paste a link to a animevost url"
  );
  const search$ = fromEvent(searchInput, "input").subscribe((event) => {
    testSlice().then((i)=>{
      console.log(i)
    })
    beh.next(event.target?.value);
  });
  const enter$ = fromEvent(searchInput, "keyup").pipe(
    filter((event) => event.keyCode === 13)
  );

  callFetchLast().then((data) => {
    addCardsToPage(
      data.map(({ title, urlImagePreview, id }) => {
        const card = createCard(title, urlImagePreview, id);
        const click$ = fromEvent(card, "click");
        click$.subscribe(({ target }) => {
          callFetchEpisodes(
            {
              epId: target.getAttribute("data-animevost-id"),
              playlist_id: document.querySelector(
                "div.mod-pl.playlist-menu > select"
              ).value,
              room_id: document
                .querySelector("#w2g-top-inviteurl > input")
                .value.split("?room_id=")[1],
            },
            document.location.href
          );
        });
        return card;
      })
    );
  });

  enter$.subscribe((data) => {
    const query = beh.getValue();
    callFetchQuery(query).then(({ data }) => {
      addCardsToPage(
        data.map(({ title, urlImagePreview, id }) => {
          const card = createCard(title, urlImagePreview, id);
          const click$ = fromEvent(card, "click");
          click$.subscribe(({ target }) => {
            callFetchEpisodes(
              {
                epId: target.getAttribute("data-animevost-id"),
                playlist_id: document.querySelector(
                  "div.mod-pl.playlist-menu > select"
                ).value,
                room_id: document
                  .querySelector("#w2g-top-inviteurl > input")
                  .value.split("?room_id=")[1],
              },
              document.location.href
            );
          });
          return card;
        })
      );
    });
  });

  const container = document.createElement("div");
  container.innerHTML = `<div data-w2g="['items', 'each']" class="animevost-cards w2g-items w2g-list-items w2g-scroll-vertical" style="display: block;">  </div>`;
  const sidebar = document.querySelector("#w2g-sidebar-menu");
  const menuItem = document.createElement("div");
  menuItem.classList.add("w2g-animevost-menu-item");
  menuItem.textContent = "Animevost";
  const tab = document.createElement("div");
  tab.classList.add("w2g-menu-tab", "w2g-animevost");
  tab.appendChild(searchInput);
  tab.appendChild(container);
  const contentRight = document.querySelector(".w2g-content-right");
  contentRight.appendChild(tab);
  sidebar.appendChild(menuItem);
}

window.addEventListener("load", init);
