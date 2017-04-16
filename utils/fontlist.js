/**
 * JavaScript code to detect available availability of a
 * particular font in a browser using JavaScript and CSS.
 *
 * Author : Lalit Patel
 * Website: http://www.lalit.org/lab/javascript-css-font-detect/
 * License: Apache Software License 2.0
 *          http://www.apache.org/licenses/LICENSE-2.0
 * Version: 0.15 (21 Sep 2009)
 *          Changed comparision font to default from sans-default-default,
 *          as in FF3.0 font of child element didn't fallback
 *          to parent element if the font is missing.
 * Version: 0.2 (04 Mar 2012)
 *          Comparing font against all the 3 generic font families ie,
 *          'monospace', 'sans-serif' and 'sans'. If it doesn't match all 3
 *          then that font is 100% not available in the system
 * Version: 0.3 (24 Mar 2012)
 *          Replaced sans with serif in the list of baseFonts
 */

/**
 * Usage: d = new Detector();
 *        d.detect('font name');
 */
 
/*Edit by PicturElements: simply provides a list of common fonts and checks them.*/

var fontsArr=["Abadi MT Condensed Light","Albertus Extra Bold","Albertus Medium","Antique Olive","Arial","Arial Black","Arial MT","Arial Narrow","Bazooka","Book Antiqua","Bookman Old Style","Boulder","Calisto MT","Calligrapher","Century Gothic","Century Schoolbook","Cezanne","CG Omega","CG Times","Charlesworth","Chaucer","Clarendon Condensed","Comic Sans MS","Copperplate Gothic Bold","Copperplate Gothic Light","Cornerstone","Coronet","Courier","Courier New","Cuckoo","Dauphin","Denmark","Fransiscan","Garamond","Geneva","Haettenschweiler","Heather","Helvetica","Herald","Impact","Jester","Letter Gothic","Lithograph","Lithograph Light","Long Island","Lucida Console","Lucida Handwriting","Lucida Sans","Lucida Sans Unicode","Marigold","Market","Matisse ITC","MS LineDraw","News GothicMT","OCR A Extended","Old Century","Pegasus","Pickwick","Poster","Pythagoras","Sceptre","Sherwood","Signboard","Socket","Steamer","Storybook","Subway","Tahoma","Technical","Teletype","Tempus Sans ITC","Times","Times New Roman","Times New Roman PS","Trebuchet MS","Tristan","Tubular","Unicorn","Univers","Univers Condensed","Vagabond","Verdana","Westminster Allegro","Amazone BT","AmerType Md BT","Arrus BT","Aurora Cn BT","AvantGarde Bk BT","AvantGarde Md BT","BankGothic Md BT","Benguiat Bk BT","BernhardFashion BT","BernhardMod BT","BinnerD","Bremen Bd BT","CaslonOpnface BT","Charter Bd BT","Charter BT","ChelthmITC Bk BT","CloisterBlack BT","CopperplGoth Bd BT","English 111 Vivace BT","EngraversGothic BT","Exotc350 Bd BT","Freefrm721 Blk BT","FrnkGothITC Bk BT","Futura Bk BT","Futura Lt BT","Futura Md BT","Futura ZBlk BT","FuturaBlack BT","Galliard BT","Geometr231 BT","Geometr231 Hv BT","Geometr231 Lt BT","GeoSlab 703 Lt BT","GeoSlab 703 XBd BT","GoudyHandtooled BT","GoudyOLSt BT","Humanst521 BT","Humanst 521 Cn BT","Humanst521 Lt BT","Incised901 Bd BT","Incised901 BT","Incised901 Lt BT","Informal011 BT","Kabel Bk BT","Kabel Ult BT","Kaufmann Bd BT","Kaufmann BT","Korinna BT","Lydian BT","Monotype Corsiva","NewsGoth BT","Onyx BT","OzHandicraft BT","PosterBodoni BT","PTBarnum BT","Ribbon131 Bd BT","Serifa BT","Serifa Th BT","ShelleyVolante BT","Souvenir Lt BT","Staccato222 BT","Swis721 BlkEx BT","Swiss911 XCm BT","TypoUpright BT","ZapfEllipt BT","ZapfHumnst BT","ZapfHumnst Dm BT","Zurich BlkEx BT","Zurich Ex BT"];

function genFontList(){
  var fontList=[];
  var detc=new Detector();
  for (var i=0;i<fontsArr.length;i++){
    if (detc.detect(fontsArr[i])){
      fontList.push(fontsArr[i]);
    }
  }
  return fontList;
}

var Detector = function() {
    // a font will be compared against all the three default fonts.
    // and if it doesn't match all 3 then that font is not available.
    var baseFonts = ['monospace', 'sans-serif', 'serif'];

    //we use m or w because these two characters take up the maximum width.
    // And we use a LLi so that the same matching fonts can get separated
    var testString = "mmmmmmmmmmlli";

    //we test using 72px font size, we may use any size. I guess larger the better.
    var testSize = '72px';

    var h = document.getElementsByTagName("body")[0];

    // create a SPAN in the document to get the width of the text we use to test
    var s = document.createElement("span");
    s.style.fontSize = testSize;
    s.innerHTML = testString;
    var defaultWidth = {};
    var defaultHeight = {};
    for (var index in baseFonts) {
        //get the default width for the three base fonts
        s.style.fontFamily = baseFonts[index];
        h.appendChild(s);
        defaultWidth[baseFonts[index]] = s.offsetWidth; //width for the default font
        defaultHeight[baseFonts[index]] = s.offsetHeight; //height for the defualt font
        h.removeChild(s);
    }

    function detect(font) {
        var detected = false;
        for (var index in baseFonts) {
            s.style.fontFamily = font + ',' + baseFonts[index]; // name of the font along with the base font for fallback.
            h.appendChild(s);
            var matched = (s.offsetWidth != defaultWidth[baseFonts[index]] || s.offsetHeight != defaultHeight[baseFonts[index]]);
            h.removeChild(s);
            detected = detected || matched;
        }
        return detected;
    }

    this.detect = detect;
};
