const utils = require("./utils");
const spinner = require("./spinner");

exports.init = ({ groups }) => groups.map(item => {
  return {
    title: item.title || "",
    rows: item.items.map(parameters => {
      const { type, key, on, value, title, symbol, text, titleColor, iconColor, handler, async } = parameters;

      if (type === "switch" && $cache.get(key) === undefined) $cache.set(key, on);
      if (type === "check" && on && $cache.get(key) === undefined) $cache.set(key, value);

      const types = {
        switch: {
          type: "switch",
          props: {
            on: $cache.get(key),
            onColor: utils.systemColor("green")
          },
          layout: (make, view) => {
            make.right.inset(20);
            make.centerY.equalTo(view.super);
          },
          events: {
            changed: sender => $cache.set(key, sender.on)
          }
        },
        arrow: {
          type: "image",
          props: {
            id: "arrowmark",
            contentMode: 1,
            symbol: "chevron.right",
            tintColor: $color("systemGray2")
          },
          layout: (make, view) => {
            make.height.equalTo(17);
            make.right.inset(20);
            make.centerY.equalTo(view.super);
          }
        },
        check: {
          type: "image",
          props: {
            id: "checkmark",
            info: value,
            contentMode: 1,
            symbol: "checkmark",
            tintColor: utils.systemColor("blue")
          },
          layout: (make, view) => {
            make.height.equalTo(20);
            make.right.inset(20);
            make.centerY.equalTo(view.super);
          },
          events: {
            ready: sender => sender.hidden = sender.info !== $cache.get(key)
          }
        },
        text: {
          type: "label",
          props: {
            text: text,
            font: $font(16),
            align: $align.right,
            textColor: $color("systemSecondaryLabel")
          },
          layout: (make, view) => {
            make.right.inset(20);
            make.centerY.equalTo(view.super);
          }
        },
        textButton: {
          type: "label",
          props: {
            text: text,
            font: $font(16),
            align: $align.right,
            textColor: $color("systemSecondaryLabel")
          },
          layout: (make, view) => {
            make.right.inset(20);
            make.centerY.equalTo(view.super);
          }
        }
      };

      const handlerAsync = async sender => {
        const id = "setting.item.async.spinner";
        const marks = {
          arrow: sender.get("arrowmark"),
          check: sender.get("checkmark")
        };
        sender.userInteractionEnabled = false;
        if ($(id)) $(id).remove();
        sender.add(spinner.init({
          id: id,
          diameter: 17,
          color: $color("systemGray2"),
          layout: (make, view) => {
            make.size.equalTo($size(17, 17));
            make.center.equalTo(marks[type]);
          },
          events: {
            ready: spinner => {
              marks[type].hidden = true;
              spinner.play();
            }
          }
        }));
        await $wait(0.4);
        await handler(value);
        $(id).remove();
        marks[type].hidden = false;
        sender.userInteractionEnabled = true;
      };

      return {
        type: "view",
        props: {
          selectable: type === "arrow" || type === "check" || type === "textButton"
        },
        layout: $layout.fill,
        events: {
          touchesEnded: sender => {
            if (typeof handler !== "function") return;
            if (type === "arrow") async ? handlerAsync(sender) : handler();
            if (type === "check") {
              sender.super.super.super.views.forEach(item => item.get("checkmark").hidden =  item.get("checkmark").info !== value);
              $cache.set(key, value);
              async ? handlerAsync(sender) : handler(value);
            }
            if (type === "textButton") handler();
          }
        },
        views: [types[type], {
          type: "view",
          props: {
            cornerRadius: 31 * 0.222,
            smoothCorners: true,
            bgcolor: iconColor,
            hidden: !symbol
          },
          layout: (make, view) => {
            make.size.equalTo($size(symbol ? 31 : 0, 31));
            make.left.inset(20);
            make.centerY.equalTo(view.super);
          },
          views: [{
            type: "image",
            props: {
              contentMode: 1,
              symbol: symbol,
              tintColor: $color("white")
            },
            layout: (make, view) => {
              make.size.equalTo($size(20, 20));
              make.center.equalTo(view.super);
            }
          }]
        },
        {
          type: "label",
          props: {
            text: title,
            textColor: titleColor
          },
          layout: (make, view) => {
            make.left.equalTo(view.prev.right).inset(symbol ? 15 : 0);
            make.centerY.equalTo(view.super);
          }
        }]
      };
    })
  };
});