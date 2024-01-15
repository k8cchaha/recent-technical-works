function doGet(e) {
  
  const html = HtmlService.createTemplateFromFile('form')

  html.data = {}
  if (e) {
    var param = e.parameter;
    var brand = param.brand;
    var promotion = param.promotion;
    var type = param.type;
    var lang = param.lang;

    var msgUpload = ''
    var msgUploading = ''
    var msgSuccess = ''
    var msgSelectFile = ''
    var msgError = ''

    switch(lang) {
      case 'jp':
        msgUpload = 'ファイルをアップロード';
        msgUploading = 'アップロード中...';
        msgSuccess = 'アップロード完了';
        msgSelectFile = 'ファイルを選択';
        msgError = '画像ファイルは3MBを超えてはなりません';
        break;
      case 'tw':
      case 'cn':
        msgUpload = '上傳檔案';
        msgUploading = '檔案上傳中...';
        msgSuccess = '檔案上傳成功！';
        msgSelectFile = '選擇檔案';
        msgError = '圖檔請勿超過3MB';
        break;
      default: 
        msgUpload = 'Upload file';
        msgUploading = 'File uploading...';
        msgSuccess = 'File uploaded';
        msgSelectFile = 'Select File';
        msgError = 'Image files should not exceed 3MB'
        break;
    }

    html.data = {
      name: brand + '-' + promotion,
      type: type,
      lang: lang,
      msgUpload: msgUpload,
      msgUploading: msgUploading,
      msgSuccess: msgSuccess,
      msgSelectFile: msgSelectFile,
      msgError: msgError
    }
  }
  
  return html.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function uploadFiles(form) {
  
  try {
    var dropbox = "KYC"; 
    if (form.type === 'Address') {
      dropbox = 'KYC-地址'
    } else if (form.type === 'Identity') {
      dropbox = 'KYC-身分證'
    } else if (form.type === 'Others') {
      dropbox = 'KYC-其他'
    }
    //----------------------------------------------
    var folder, folders = DriveApp.getFoldersByName(dropbox);
    
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(dropbox);
    }
    
    var blob = form.myFile;    
    var file = folder.createFile(blob);    
    file.setDescription("上傳者： " + form.myName);
    file.setName(form.myName)
    
    return form.msgSuccess 
  } catch (error) {
    return error.toString();
  }
}
