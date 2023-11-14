# to be included in /etc/rc.local
import sys
from PyQt5.QtCore import QUrl
from PyQt5.QtWidgets import QApplication, QMainWindow, QWebEngineView

class WebBrowser(QMainWindow):
    def __init__(self):
        super().__init__()
        
        self.browser = QWebEngineView()
        self.browser.setUrl(QUrl("http://localhost:5000"))
        
        self.setCentralWidget(self.browser)
        self.showFullScreen()  # Set the window to full-screen mode
        self.browser.show()

def main():
    app = QApplication(sys.argv)
    window = WebBrowser()
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()
