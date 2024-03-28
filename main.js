function getQrCode(text){
    return new QRious({
        value: text,
        backgroundAlpha: 0,
        foreground: 'white',
        level: 'H',
        padding: 0,
        size: 2048, // (soapu) sometimes the qrs can have additional padding even with a very obnovious size. weird.
    }).toDataURL();
}

function fetchMedia(cb) {
    let parsedInfo = []
    /* (soapu)
       alternatively, if you have cors-anywhere, 
       you can also use web-cdn and f-around w/ HGROMIS if you know how to. c: 
       i did gave it some spins but couldn't get the new homePage logic working on my end (shrug) */
    const addr = atob("aHR0cHM6Ly9uZXdzLWFwcC5hcGkuYmJjLmNvLnVrL2ZkL2FibD9wYWdlPWNocnlzYWxpc19kaXNjb3Zlcnkmc2VydmljZT1uZXdzJnR5cGU9aW5kZXgmY2xpZW50TmFtZT1DaHJ5c2FsaXM=");
    fetch(`${addr}`) // front_page
    .then(j => j.json())
    .then(data => {
        const items = data.data.items[0].items; // (soapu) top stories - it's always 7 headlines.
        if (items) { items.forEach(item => {
            // (gp) all the headlines contain images, don't they?
            // (soapu) not always. this was also seen on the first samples of the BF, so we add a check as a precaution.
            const imagesource = item.image?.source?.url?.replace("{width}", 720)
            parsedInfo.push({
                title: item.text,
                brief: item.subtext,
                location: getQrCode(`https://www.bbc.co.uk${item.link.destinations[0].id}`),
                image: imagesource.includes("breaking-large-promo-nc") ? 'breaking.jpg' : (imagesource || 'fallback.png'),
            });
        })}
    }).then(()=>{
        cb(parsedInfo)
    });
}

fetchMedia(function(headlines){
    loopify("bfloop.mp3", function(err,loop) {
        if (err) {
            console.error(err)
        }
        loop.play()
    }) 
    setTimeout(function() { // (soapu) may or may not depend on a larger delay depending per-browser engine.
    const newswrapper = document.getElementById('newswrapper');
    let active;
    let activeline = 0;
    headlines.forEach((headline, i) => {
        let activeclass = "";
        if (!active && i === 0) {
            activeclass = "active";
            active = 0;
        }
        newswrapper.insertAdjacentHTML('beforeend', `<div class="newsitem ${activeclass}"> 
            <div class="headline">
            <div class="bgline"><span class="line"></span></div>
            <div class="news">
            <span class="title">${headline.title}</span>
            <span class="brief">${headline.brief}</span></div></div>
            <div class="imagewrap"><img class="newsimage" src="${headline.image}">
            <div class="qrwrapper"><img class="qrimage" src="${headline.location}"></div></div></div>`);
        document.querySelectorAll('.newsitem')[0].classList.add(`sel-${activeline}`)
    })
    
    document.querySelectorAll('.news').forEach(news => {
        news.addEventListener('animationiteration', ()=>{
            const headlines = document.querySelectorAll('.newsitem');
            document.querySelectorAll('.newsitem')[active].classList.remove('active')
            document.querySelectorAll('.newsitem')[active].classList.remove(`sel-${activeline}`)
            if (active != headlines.length - 1) {
                active++
            }
            else { active = 0 }
            document.querySelectorAll('.newsitem')[active].classList.remove(`sel-${activeline}`)
            if (activeline === 0) {
                activeline = 1;
            }
            else {
                activeline = 0;
            }
            document.querySelectorAll('.newsitem')[active].classList.add(`sel-${activeline}`)
            document.querySelectorAll('.newsitem')[active].classList.add('active')
        });
    });
    }, 1850)
});
