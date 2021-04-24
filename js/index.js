

const content = document.querySelector('.content');
const navMenuMore = document.querySelector('.nav-menu-more');
const showMore = document.querySelector('.show-more');
const formSearch = document.querySelector('.form-search');
const subscriptionsList = document.querySelector('.subscriptions-list');



const createCard = (dataVideo) => {
  

    const imgUrl = dataVideo.snippet.thumbnails.high.url;
    const videoId = typeof dataVideo.id === 'string' ? dataVideo.id : dataVideo.id.videoId;
    const titleVideo = dataVideo.snippet.title;
    const viewCount = dataVideo.statistics?.viewCount;
    const dateVideo = dataVideo.snippet.publishedAt;
    const channelTitle = dataVideo.snippet.channelTitle;

    const card = document.createElement('li');
    card.classList.add('video-card')
    card.innerHTML = `
            <div class="video-thumb">
              <a class="link-video youtube-modal" href="https://youtu.be/${videoId}">
                <img src="${imgUrl}" alt="" class="thumbnail">
              </a>
            </div>
            <h3 class="video-title">${titleVideo}</h3>
            <div class="video-info">
              <span class="video-counter">
              ${viewCount ? `<span class="video-views">${getViewer(viewCount)}</span>` : ''}
                <span class="video-date">${getDate(dateVideo)}</span>
              </span>
                  <span class="video-channel">${channelTitle}</span>
            </div> 
    `;
    return card;
};

const createList = (listVideo, title, clear) => {

  const channel = document.createElement('section');
  channel.classList.add('channel');

  if(clear) {
    content.textContent = '';
  }
  if(title) {
    const header = document.createElement('h2');
    header.textContent = title;
    channel.insertAdjacentElement('afterbegin', header)
  }

  const wrapper = document.createElement('ul');
  wrapper.classList.add('video-list');
  channel.insertAdjacentElement('beforeend', wrapper);

    listVideo.forEach(item => {
        const card = createCard(item);
        wrapper.append(card)
   });

    content.insertAdjacentElement('beforeend', channel);
};

const createSubList = listVideo => {
  subscriptionsList.textContent = '';
  listVideo.forEach(item => {
    const { resourceId: {channelId: id}, title, thumbnails: {high: {url}}} = item.snippet;
    const html = `
    <li class="nav-item">
    <a href="#" class="nav-link" data-channel-id="${id}" data-title="${title}">
      <img src="${url}" alt="${title}" class="nav-image">
      <span class="nav-text">${title}</span>
    </a>
  </li>
  `;
    subscriptionsList.insertAdjacentHTML('beforeend', html);
  });
  };



  const getDate = (date) => {
    const currentDay = Date.parse(new Date());
    const days = Math.round((currentDay - Date.parse(new Date(date))) / 86400000); 
    if (days > 30){
        if (days > 60) {
            return Math.round(days/30) + ' month ago'
        }
        return 'One month ago';
    }
    if (days > 1) {
      return Math.round(days) + ' days ago'
  }
  return 'One day ago';
  };

  const getViewer = count => {
      if (count >= 1000000) {
        return Math.round(count / 1000000) + ' M views'
      }

      if (count >= 1000) {
        return Math.round(count / 1000) + ' K views'
      }

      return count + ' views'
  };

// Youtube API 

const authBtn = document.querySelector('.auth-btn');
const userAvatar = document.querySelector('.user-avatar');

const handleSuccessAuth = data => {
  authBtn.classList.add('hide');
  userAvatar.classList.remove('hide');
  console.log(data);
  userAvatar.alt = data.getName();
  userAvatar.src = data.getImageUrl();
  
  requestSubscriptions(createSubList)
};

const handleNoAuth = () => {
  authBtn.classList.remove('hide');
  userAvatar.classList.add('hide');
  userAvatar.src = '';
  userAvatar.alt = '';
}

const handleAuth = () => {
    gapi.auth2.getAuthInstance().signIn();
};

const handleSignOut = () => {
   gapi.auth2.getAuthInstance().signOut();
};

const updateStatusAuth = data =>{
    data.isSignedIn.listen(() =>{
        updateStatusAuth(data);
    })

    if (data.isSignedIn.get()) {
      const userData = data.currentUser.get().getBasicProfile();
      handleSuccessAuth(userData)
    } else {
      handleNoAuth();
    }
}

function initClient() {
  gapi.client.init({
      'apiKey': API_KEY,
      'clientId': CLIENT_ID,
      'scope': 'https://www.googleapis.com/auth/youtube.readonly',
      'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
  }).then(() => {
      updateStatusAuth(gapi.auth2.getAuthInstance())
      authBtn.addEventListener('click', handleAuth);
      userAvatar.addEventListener('click', handleSignOut);
  })
  .then(loadScreen)
  .catch(e => {
    console.warn(e)
  });
};

gapi.load('client:auth2', initClient);

const getChannel = () => {
  gapi.client.youtube.channels.list({
      part: 'snippet, statistics',
      id: 'UCVswRUcKC-M35RzgPRv8qUg',
  }).then((response) =>{
    console.log(response);
  })
};

const requestVideos = (channelId, callback, maxResults = 6) => {
   gapi.client.youtube.search.list({
      part: 'snippet',
      channelId,
      maxResults,
      order: 'date',
    }).execute(response => {
      callback(response.items)
    })
};

const requestTrending = (callback, maxResults = 6) => {
  gapi.client.youtube.videos.list({
    part: 'snippet, statistics',
    chart: 'mostPopular',
    regionCode: "RU",
    maxResults,
  }).execute(response => {
    callback(response.items)
  })
};

const requestMusic = (callback, maxResults = 6) => {
  gapi.client.youtube.videos.list({
    part: 'snippet, statistics',
    chart: 'mostPopular',
    regionCode: "RU",
    maxResults,
    videoCategoryId:'10',
  }).execute(response => {
    callback(response.items)
  })
};

const requestSearch = (searchText, callback, maxResults = 12) => {
  gapi.client.youtube.search.list({
    part: 'snippet',
    q: searchText,
    maxResults,
    order: 'relevance',
  }).execute(response => {
    callback(response.items)
  })
};

//ДОМАШКА  вызов после авторизации, написать колл бэк
const requestSubscriptions = (callback, maxResults = 6) => {
  gapi.client.youtube.subscriptions.list({
    part: 'snippet',
    mine: true,
    maxResults,
    order: 'unread',
  }).execute(response => {
    callback(response.items);
})
};

const loadScreen = () => {
  
  
  requestVideos('UCVswRUcKC-M35RzgPRv8qUg', data => {
    content.textContent = '';
    createList(data, 'Glo Academy');

    requestTrending(data => {
      createList(data, 'Популярные видео');
      requestMusic(data => {
        createList(data, 'Популярная музыка');
      });
    });
  });


formSearch.addEventListener('submit', event => {
  event.preventDefault();
  const value = formSearch.elements.search.value;
  requestSearch(value, data => {
    createList(data, 'Результат поиска', true);
  });
})

};
showMore.addEventListener('click', (event) => {
  event.preventDefault();
  navMenuMore.classList.toggle('nav-menu-more-show')
});

subscriptionsList.addEventListener('click', event => {
  event.preventDefault();
  const target = event.target;
  const linkChanel = target.closest('.nav-link');
  const channelId = linkChanel.dataset.channelId;
  const title = linkChanel.dataset.title;
  requestVideos(channelId, data => {
    createList(data, title, true);
  }, 6)
});









