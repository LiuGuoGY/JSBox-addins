let utils = require('scripts/utils')

function show(view) {
  playMusic(view)
}

function emojiText() {
  return utils.getCache("welcomeEmoji", "")
}

function playMusic(view) {
  let url = utils.getCache("welcomeMusic", "")
  if(url.length > 0) {
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

function playEmoji(view, duration) {
  let text = emojiText()
  let number = 0, x = 0;
  if(text.length > 0) {
    let timer = $timer.schedule({
      interval: 0.2,
      handler: function() {
        x = Math.random() * (view.frame.width - 40) + 20
        let id = "welcome_" + number
        let index = Math.floor(Math.random()*(text.length / 2))
        view.add({
          type: "label",
          props: {
            id: id,
            text: text.substr(index * 2, 2),
            font: $font(19),
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
          duration: Math.random() * 0.5 + 2.5,
          velocity: 2,
          animation: function() {
            $(id).relayout()
          },
          completion: function() {
            if($(id)) {
              $(id).remove()
            }
          }
        })
        number ++;
        if(duration == undefined) {
          duration = 3
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