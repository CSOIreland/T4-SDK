export function looseParseFromString(str: string) {
    const parser = new DOMParser();
    str = str.replace(/ \/>/g, '>').replace(/(<(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr).*?>)/g, '$1</$2>');
    const xdom = parser.parseFromString('<xml>'+str+'</xml>', 'text/xml');
    const hdom = parser.parseFromString('', 'text/html');
    for (const elem of Array.from(xdom.documentElement.children)) {
      hdom.body.appendChild(elem);
    }
    for (const elem of Array.from(hdom.querySelectorAll('area,base,br,col,command,embed,hr,img,input,keygen,link,meta,param,source,track,wbr'))) {
      elem.outerHTML = '<'+elem.outerHTML.slice(1).split('<')[0];
    }
    return hdom;
  }