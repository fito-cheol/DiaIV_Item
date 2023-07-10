import path from 'path'
import { app, Tray, Menu, shell, nativeImage, dialog } from 'electron'

export class AppTray {
  public overlayKey = 'Shift + Space'
  private tray: Tray

  constructor () {
    const trayIconPath = path.join(__dirname, 'public', process.platform === 'win32' ? 'bear_foot.ico' : 'bear_foot.png')
    console.log(trayIconPath)
    this.tray = new Tray(
      nativeImage.createFromPath(trayIconPath)
    )
    this.tray.setToolTip(`Diablo4: 아이템 판별기 v${app.getVersion()}`)
    this.rebuildMenu()
  }

  rebuildMenu () {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open config folder',
        click: () => {
          shell.openPath(path.join(app.getPath('userData'), 'apt-data'))
        }
      },
      {
        label: 'Quit',
        click: () => {
          app.quit()
        }
      }
    ])

    this.tray.setContextMenu(contextMenu)
  }
}
