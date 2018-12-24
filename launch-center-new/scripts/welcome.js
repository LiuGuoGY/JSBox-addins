function show(view) {
  playMusic(view)
}

async function emojiText() {
  let url = "https://raw.githubusercontent.com/LiuGuoGY/JSBox-addins/master/launch-center/emoji.txt"
  let resp = await $http.download({
    url: url,
    showsProgress: false,
  })
  return (resp.data.string)
}

function playMusic(view) {
  let url = "https://github.com/LiuGuoGY/JSBox-addins/raw/master/launch-center/music.mp3"
  $http.get({
    url: url,
    handler: function(resp) {
      if(resp.response.statusCode !== 404) {
        $audio.play({
          url: url,
          events: {
            newAccessLogEntry: function() {
              if($audio.status != 0) {
                playEmoji(view, $audio.duration)
              }
            },
          }
        });
      } else {
        playEmoji(view)
      }
    }
  })
}

async function playEmoji(view, duration) {
  let text = await emojiText()
  let number = 0, x = 0;
  if(text.length > 0) {
    let timer = $timer.schedule({
      interval: 0.2,
      handler: function() {
        x = Math.random() * (view.frame.width - 20) + 10
        let id = "welcome_" + number
        view.add({
          type: "label",
          props: {
            id: id,
            text: text,
            font: $font(17),
            align: $align.center,
          },
          layout: function(make, view) {
            make.left.inset(0).offset(x)
            make.top.inset(0).offset(-20)
          }
        })
        $(id).relayout()
        $(id).updateLayout(function(make) {
          make.top.inset(0).offset(view.frame.height + 40)
        })
        $ui.animate({
          duration: 2,
          velocity: 2,
          animation: function() {
            $(id).relayout()
          },
          completion: function() {
            if($(id)) {
              $(id).remove()
            } else {
              $console.info(id);
            }
          }
        })
        number ++;
        if(duration == undefined) {
          duration = 2
        }
        if(0.2 * number >= duration) {
          timer.invalidate()
        }
      }
    });
  }
}


module.exports = {
  show: show,
}