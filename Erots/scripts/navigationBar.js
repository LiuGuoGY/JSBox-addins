const utils = require("./utils");

const view = ({
  style = 0,
  title = "",
  pageName = "",
  btnTitle = "",
  subviews = [],
  largeTitleInset = 16
} = {}) => {
  const id = [
    pageName + ".navigationBar.view",
    pageName + ".navbar.blurEffect",
    pageName + ".standard.title",
    pageName + ".large.title",
    pageName + ".large.title.container",
  ];

  const largeTitle = {
    type: "view",
    props: {
      id: id[4],
      clipsToBounds: true
    },
    layout: (make, view) => {
      make.height.equalTo(56);
      make.left.equalTo($ui.window.safeAreaLeft);
      make.right.equalTo($ui.window.safeAreaRight);
      make.bottom.inset(0);
    },
    views: [{
      type: "label",
      props: {
        id: id[3],
        text: title,
        font: $font("bold", 34),
        textColor: $color("systemLabel")
      },
      layout: (make, view) => {
        make.width.equalTo(view.super);
        make.height.equalTo(56);
        make.left.inset(largeTitleInset);
        make.bottom.inset(0);
      }
    }]
  };

  const btnTitleSize = utils.sizeThatFits(btnTitle, {
    font: $font(16),
    size: {
      width: 100,
      height: 44
    }
  });

  const backButton = {
    type: "button",
    props: {
      cornerRadius: 0,
      bgcolor: $color("clear")
    },
    layout: (make, view) => {
      make.width.equalTo(btnTitleSize.width + (btnTitle ? 32 : 26));
      make.height.equalTo(44);
      make.top.equalTo($ui.window.safeAreaTop);
      make.left.equalTo($ui.window.safeAreaLeft).inset(10);
    },
    events: {
      tapped: sender => $ui.pop()
    },
    views: [{
      type: "image",
      props: {
        symbol: "chevron.left",
        tintColor: $color("systemLabel"),
        contentMode: 1
      },
      layout: (make, view) => {
        make.size.equalTo($size(26, 26));
        make.left.centerY.equalTo(view.super);
      }
    },
    {
      type: "label",
      props: {
        text: btnTitle,
        font: $font(16),
        textColor: $color("systemLabel")
      },
      layout: (make, view) => {
        make.left.equalTo(view.prev.right);
        make.centerY.equalTo(view.super);
      }
    }]
  };

  return {
    type: "view",
    props: {
      id: id[0],
      hidden: $app.env !== $env.app
    },
    layout: (make, view) => {
      make.top.left.right.inset(0);
      make.bottom.equalTo($ui.window.safeAreaTop).offset($app.env !== $env.app ? 0 : style ? 44 : 100);
    },
    events: {
      ready: sender => sender.moveToFront()
    },
    views: [{
      type: "blur",
      props: {
        id: id[1],
        style: 10,
        alpha: style
      },
      layout: $layout.fill,
      views: [{
        type: "view",
        props: {
          bgcolor: $color("separatorColor")
        },
        layout: (make, view) => {
          make.height.equalTo(1 / $device.info.screen.scale);
          make.left.right.bottom.inset(0);
        }
      }]
    },
    {
      type: "view",
      layout: (make, view) => {
        make.height.equalTo(44);
        make.top.equalTo($ui.window.safeAreaTop);
        make.left.equalTo($ui.window.safeAreaLeft);
        make.right.equalTo($ui.window.safeAreaRight);
      },
      views: [...subviews, {
        type: "label",
        props: {
          id: id[2],
          text: title,
          font: $font("bold", 17),
          align: $align.center,
          alpha: style
        },
        layout: (make, view) => {
          make.left.right.inset(btnTitleSize.width + (btnTitle ? 72 : 66));
          make.centerY.equalTo(view.super);
        }
      }]
    }, style ? backButton : largeTitle]
  };
};

const changeLayout = (pageName, offsetY, animate = true) => {
  const id = [
    pageName + ".navigationBar.view",
    pageName + ".navbar.blurEffect",
    pageName + ".standard.title",
    pageName + ".large.title",
    pageName + ".large.title.container",
  ];
  const isHorizontalScreen = utils.statusBarOrientation() === 3 || utils.statusBarOrientation() === 4;
  const trigger = 56 - offsetY <= 16;
  const opacity = parseFloat(((offsetY - 40) / 100 / 0.16).toFixed(2));
  const _size = parseFloat((34 - offsetY * 0.04).toFixed(2));
  animate = opacity >= -0.2 && opacity <= 0.2;
  $(id[0]).updateLayout((make, view) => make.bottom.equalTo(view.super.super.safeAreaTop).offset(isHorizontalScreen ? 44 : offsetY <= 0 ? Math.abs(offsetY) + 100 : offsetY < 56 ? 100 - offsetY : 44));
  $(id[4]).updateLayout(make => make.height.equalTo(isHorizontalScreen ? 0 : 56 - offsetY));
  $(id[0]).relayout();
  $(id[4]).relayout();
  $(id[1]).alpha = isHorizontalScreen || opacity > 1 ? 1 : opacity < 0 ? 0 : opacity;
  $(id[3]).font = $font("bold", _size > 38 ? 38 : _size < 34 ? 34 : _size);
  $ui.animate({
    duration: animate ? 0.25 : 0.01,
    animation: () => {
      $(id[2]).alpha = isHorizontalScreen || trigger ? 1 : 0;
      $(id[3]).alpha = isHorizontalScreen || trigger ? 0 : 1;
    }
  });
};


module.exports = {view, changeLayout};
