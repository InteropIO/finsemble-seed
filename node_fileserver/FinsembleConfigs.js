
module.exports = function () {
    return {
        "FSBL": {
            "main_component": {
                "url": "http://localhost/components/toolbar/toolbar.html",
                "name": "Launcher"
            }
        },
        "devtools_port": 9090,
        "startup_app": {
            "name": "ChartIQ Local",
            "url": "http://localhost/components/serviceManager/serviceManager.html",
            "uuid": "ChartIQ",
            "applicationIcon": "http://localhost/components/assets/img/CIQ_Taskbar_Icon.png",
            "defaultTop": 0,
            "defaultLeft": 0,
            "showTaskbarIcon": true,
            "autoShow": true,
            "frame": false,
            "resizable": false,
            "maximizable": false,
            "delay_connection": true,
            "contextMenu": true,
            "cornerRounding": {
                "width": 4,
                "height": 4
            },
            "alwaysOnTop": false,
            "frameConnect": "main-window",
            "customData": {
                "finsemble": {
                    "services": require("../configs/services.json"),
                    "components": require("../configs/components.json")
                }
            }
        },
        "runtime": {
            "arguments": "--noerrdialogs  --v=1",
            "version": "stable"
        },
        "shortcut": {
            "company": "ChartIQ",
            "description": "ChartIQ Local",
            "icon": "http://localhost/components/assets/img/CIQ_Taskbar_Icon.ico",
            "name": "ChartIQ - LOCAL",
            "target": [
                "desktop",
                "start-menu"
            ],
            "force": false,
            "startMenuRootFolder": "ChartIQ Local"
        },
        "dialogSettings": {
            "logo": "http://localhost/components/assets/img/ciq-banner-100x25.png",
            "bgColor": 4280798349,
            "textColor": 4293521652,
            "progressBarBgColor": 4294967295,
            "progressBarFillColor": 4282684881,
            "progressBarBorderColor": 4293521652
        },
        "supportInformation": {
            "company": "ChartIQ",
            "product": "ChartIQ Desktop",
            "email": "support@chartiq.com"
        },
        "fileName": "ChartIQ-local-installer"
    }
}