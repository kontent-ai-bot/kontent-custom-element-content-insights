import { DeliveryClient } from "@kentico/kontent-delivery";

export default class RichTextClient {
  constructor(projectId, apiKey) {
    this.deliveryClient = new DeliveryClient({
      projectId: projectId,
      enablePreviewMode: true,
      previewApiKey: apiKey
    });
  }

  getRichTextValue(sourceItemCodename, richTextElementCodename) {
    return new Promise((resolve, reject) => {
      try {
        this.deliveryClient
          .item(sourceItemCodename)
          .elementsParameter([richTextElementCodename])
          .toPromise()
          .then(response => {
            let htmlContent = response.item[richTextElementCodename].value;
            let content = this._removeHTML(htmlContent);
            resolve(content);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  _removeHTML(text) {
    let htmless = text.replace(/<(?:.|\n)*?>/gm, "");
    return htmless.replace(/&nbsp;/gi, "");
  }
}
