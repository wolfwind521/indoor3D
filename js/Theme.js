/**
 * Created by gaimeng on 2015/11/3.
 * Some themes for test
 */



var testTheme = {

    name: "picGenTheme", //theme's name
    background: "#F2F2F2", //background color

    //building's style
    building: {
        color: "#000000",
        opacity: 0.1,
        transparent: true,
        depthTest: false
    },

    //floor's style
    floor: {
        color: "#E0E0E0",
        opacity: 1,
        transparent: false
    },

    //selected room's style
    selected: "#fffdb0",

    //rooms' style
    room: function (type, category) {
        var roomStyle;
        if(category == undefined) {
            switch (type) {

                case "100": //hollow. u needn't change this color. because i will make a hole on the model in the final version.
                    return {
                        color: "#F2F2F2",
                        opacity: 0.8,
                        transparent: true
                    }
                case "300": //closed area
                    return {
                        color: "#D3D3D3",
                        opacity: 0.7,
                        transparent: true
                    };
                case "400": //empty shop
                    return {
                        color: "#D3D3D3",
                        opacity: 0.7,
                        transparent: true
                    };
                default :
                    break;
            }
        }

        switch(category) {
            case 101: //food
                roomStyle = {
                    color: "#D3D3D3",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 102: //retail
                roomStyle = {
                    color: "#D3D3D3",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 103: //toiletry
                roomStyle = {
                    color: "#D3D3D3",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 104: //parent-child
                roomStyle = {
                    color: "#D3D3D3",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 105: //life services
                roomStyle = {
                    color: "#D3D3D3",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 106: //education
                return {
                    color: "#D3D3D3",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 107: //life style
                roomStyle = {
                    color: "#D3D3D3",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 108: //entertainment
                roomStyle = {
                    color: "#D3D3D3",
                    opacity: 0.7,
                    transparent: true
                };
                break;
            case 109: //others
                roomStyle = {
                    color: "#D3D3D3",
                    opacity: 0.7,
                    transparent: true
                };
            default :
                roomStyle = {
                    color: "#D3D3D3",
                    opacity: 0.7,
                    transparent: true
                };
                break;
        }
        return roomStyle;
    },

    //room wires' style
    strokeStyle: {
        color: "#5C4433",
        opacity: 0.5,
        transparent: true,
        linewidth: 1
    },

    fontStyle:{
        color: "#231815",
        fontsize: 0,
        fontface: "Helvetica, MicrosoftYaHei "
    },

    pubPointImg: {

        "11001": System.imgPath+"/toilet.png",
        "11002": System.imgPath+"/ATM.png",
        "21001": System.imgPath+"/stair.png",
        "22006": System.imgPath+"/entry.png",
        "21002": System.imgPath+"/escalator.png",
        "21003": System.imgPath+"/lift.png"
    }

}