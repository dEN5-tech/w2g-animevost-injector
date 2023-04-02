import { onMessage } from "./utils";

const headers_ = {
  authority: "w2g-api.w2g.tv",
  accept: "application/json",
  "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5",
  "content-type": "application/json",
  cookie: "w2glang=ru",
  origin: "https://w2g.tv",
  referer: "https://w2g.tv/",
  "sec-ch-ua":
    '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-site",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
};

async function getAllInfoRoom(cookie, roomId) {
  const url = `https://w2g-api.w2g.tv/rooms/${roomId}/sync_state`;
  const headers = {
    ...headers_,
    cookie: cookie,
  };

  const response = await fetch(url, { headers });
  const jsonResponse = await response.json();
  return jsonResponse.state[3][1].payload.lists;
}

async function creatingPlaylist(title, roomId, cookie) {
  const url = `https://w2g-api.w2g.tv/rooms/${roomId}/playlists/sync_update`;
  const info = `Import: Animevost | ${title}`;
  const payload = JSON.stringify({
    new_list: info,
    personal_list: false,
  });
  const headers = {
    ...headers_,
    cookie: cookie,
  };

  const response = await fetch(url, { method: "POST", headers, body: payload });
  const allInfo = await getAllInfoRoom(cookie, roomId);
  return allInfo.filter((item) => item.title === info)[0].key;
}

async function deleByPosIdPlaylist(out) {
  const { cookie, playlist_id, room_id, id } = out;
  const response = await fetch(
    `https://w2g-api.w2g.tv/rooms/${room_id}/playlists/${playlist_id}/playlist_items/sync_update`,
    {
      headers: {
        accept: "application/json",
        "accept-language":
          "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5",
        "content-type": "application/json",
        "sec-ch-ua":
          '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        cookie: cookie,
      },
      referrer: "https://w2g.tv/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: `{"delete_item":${id},"item_pos":0}`,
      method: "POST",
      mode: "cors",
      credentials: "include",
    }
  );
  const jsonResponse = await response.json();
}

async function getPlaylist(out) {
  const { cookie, playlist_id, room_id } = out;
  const response = await fetch(
    `https://w2g-api.w2g.tv/streams/${room_id}/playlists/${playlist_id}/playlist_items`,
    {
      headers: {
        accept: "*/*",
        "accept-language":
          "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5",
        "cache-control": "max-age=0",
        "sec-ch-ua":
          '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        cookie: cookie,
      },
      referrer: "https://w2g.tv/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    }
  );
  const jsonResponse = await response.json();
  return jsonResponse;
}

async function setPlaylist(dct, cookie, playlistId, roomId) {
  const url = `https://w2g-api.w2g.tv/rooms/${roomId}/playlists/${playlistId}/playlist_items/sync_update`;
  const payload = JSON.stringify({
    add_items: [
      {
        url: dct.std,
        title: dct.name,
        thumb: dct.preview,
      },
    ],
  });
  const headers = {
    ...headers_,
    cookie: cookie,
  };

  const response = await fetch(url, { method: "POST", headers, body: payload });
}

async function getInfo(id) {
  const data = JSON.stringify({ id: `${id}` });
  const headers = {
    "Content-Type": "application/json",
  };
  const response = await fetch("https://api.animevost.org/v1/info", {
    method: "POST",
    headers,
    body: data,
  });
  const jsonResponse = await response.json();
  return jsonResponse.data[0].title.split("/ ")[0];
}

async function getepisodes(out) {
  const { epId, cookie, playlist_id, room_id } = out;
  const response = await fetch("https://api.animevost.org/v1/playlist", {
    headers: {
      accept: "*/*",
      "accept-language":
        "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5",
      "content-type": "application/x-www-form-urlencoded",
      "sec-ch-ua":
        '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
    },
    referrer: "https://reansn0w.github.io/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: `id=${epId}`,
    method: "POST",
    mode: "cors",
    credentials: "omit",
  });
  const jsonResponse = await response.json();
  console.log(jsonResponse);
  Promise.all(
    jsonResponse.map((i) => setPlaylist(i, cookie, playlist_id, room_id))
  );
}

async function callFetchInfo(url) {
  return new Promise((resolve, reject) => {
    chrome.cookies.getAll({ url }, function (cookies) {
      var cookieString = "";
      for (var i = 0; i < cookies.length; i++) {
        cookieString += cookies[i].name + "=" + cookies[i].value + "; ";
      }
      resolve(cookieString);
    });
  });
}


onMessage("animevostSearch").subscribe((query) => {
  fetch("https://api.animevost.org/v1/search", {
    headers: {
      accept: "*/*",
      "accept-language":
        "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5",
      "content-type": "application/x-www-form-urlencoded",
      "sec-ch-ua":
        '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
    },
    referrer: "https://reansn0w.github.io/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: `name=${query}`,
    method: "POST",
    mode: "cors",
    credentials: "omit",
  }).then((response) => {
    const json = response.json();
    json.then(({ data }) => {
      chrome.runtime.sendMessage({ data });
    });
  });
});

onMessage("animevostLast").subscribe(() => {
  fetch("https://api.animevost.org/v1/last?page=1&quantity=20", {
    headers: {
      accept: "*/*",
      "accept-language":
        "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5",
      "sec-ch-ua":
        '"Chromium";v="110", "Not A(Brand";v="24", "Google Chrome";v="110"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
    },
    referrer: "https://reansn0w.github.io/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "omit",
  }).then((response) => {
    const json = response.json();
    json.then(({ data }) => {
      chrome.runtime.sendMessage({ data });
    });
  });
});

onMessage("getepisodes").subscribe((request) => {
  const { data } = request;

  callFetchInfo(request.url).then((cookie) => {
    getPlaylist({ ...data, cookie }).then((playlist) => {
      Promise.all(
        playlist.map(({ id }) => deleByPosIdPlaylist({ ...data, cookie, id }))
      );
      getepisodes({ ...data, cookie })
        .then((et) => {
          chrome.runtime.sendMessage({ data: et });
        })
        .catch((error) => {
          console.error("Error getting episodes: ", error);
          chrome.runtime.sendMessage({ error });
        });
    });
  });
});
