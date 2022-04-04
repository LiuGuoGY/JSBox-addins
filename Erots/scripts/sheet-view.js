class SheetAddNavBarError extends Error {
  constructor() {
      super("Please call setView(view) first.")
      this.name = "SheetAddNavBarError"
  }
}

class SheetViewTypeError extends ValidationError {
  constructor(parameter, type) {
      super(parameter, type)
      this.name = "SheetViewTypeError"
  }
}

class Sheet extends View {
  init() {
      const UIModalPresentationStyle = { pageSheet: 1 } // TODO: sheet style
      const { width, height } = $device.info.screen
      const UIView = $objc("UIView").invoke("initWithFrame", $rect(0, 0, width, height))
      const PSViewController = $objc("UIViewController").invoke("alloc.init")
      const PSViewControllerView = PSViewController.$view()
      PSViewControllerView.$setBackgroundColor($color("primarySurface"))
      PSViewControllerView.$addSubview(UIView)
      PSViewController.$setModalPresentationStyle(UIModalPresentationStyle.pageSheet)
      this._present = () => {
          PSViewControllerView.jsValue().add(this.view)
          $ui.vc.ocValue().invoke("presentModalViewController:animated", PSViewController, true)
      }
      this._dismiss = () => PSViewController.invoke("dismissModalViewControllerAnimated", true)
      return this
  }

  /**
   * 设置 view
   * @param {Object} view 视图对象
   * @returns this
   */
  setView(view = {}) {
      if (typeof view !== "object") throw new SheetViewTypeError("view", "object")
      this.view = view
      return this
  }

  /**
   * 为 view 添加一个 navBar
   * @param {String} title 标题
   * @param {Function} callback 按钮回调函数，若未定义则调用 this.dismiss()
   * @param {String} btnText 按钮显示的文字，默认为 "Done"
   * @returns this
   */
  addNavBar(title, callback, btnText = "Done") {
      if (this.view === undefined) throw new SheetAddNavBarError()
      const pageController = new PageController()
      pageController.navigationItem
          .addPopButton("", { // 返回按钮
              type: "button",
              props: {
                  bgcolor: $color("clear"),
                  tintColor: UIKit.linkColor,
                  title: btnText,
                  titleColor: UIKit.linkColor,
                  font: $font("bold", 16)
              },
              layout: (make, view) => {
                  make.left.inset(15)
                  make.centerY.equalTo(view.super)
              },
              events: {
                  tapped: () => {
                      this.dismiss()
                      if (typeof callback === "function") callback()
                  }
              }
          })
          .setTitle(title)
          .setLargeTitleDisplayMode(NavigationItem.LargeTitleDisplayModeNever)
      pageController
          .setView(this.view)
          .navigationController.navigationBar
          .withoutStatusBarHeight()
      this.view = pageController.getPage().definition
      return this
  }

  /**
   * 弹出 Sheet
   */
  present() {
      this._present()
  }

  /**
   * 关闭 Sheet
   */
  dismiss() {
      this._dismiss()
  }
}


module.exports = {
  Sheet: Sheet,
}