function CustomTooltip () {}

CustomTooltip.prototype.init = function(params) {
    var eGui = this.eGui = document.createElement('div');
    var color = params.color || 'white';
    var data = params.api.getRowNode(params.rowIndex).data;


    eGui.classList.add('custom-tooltip');
    eGui.style['background-color'] = color;
    eGui.innerHTML =
        '<p><span class"name">' + securitiesList[symbolList.indexOf(data.security)] + '</span></p>' 
};

CustomTooltip.prototype.getGui = function() {
    return this.eGui;
};
