var _viewQuoteInfo = function() {
  return {
    init: async () => {
      const scope = _viewQuoteInfo;

      scope.activefile = 'Active';

      $('#quote-details-offcanvas-container .offcanvas-body #canvasCloseDiv').on('click', scope.closeCanvas);
    },
    routeQuotesExpanded: (quoteUniqueGUID) => {
      _appRouter.routeTo('expanded_quotes', true, {
        entityGuid: quoteUniqueGUID
      });
    },
    initData: (quoteInfo) => {

      const quoteReferenceNumber = JSON.parse(quoteInfo.JSONData).QuoteReferenceNumber || '';
      const quoteClientName = JSON.parse(quoteInfo.JSONData).Client || '';

      quoteDataHTML = `
                <div class="row">
                  <div class="col-8">
                    <div class="mt-4">
                      <p class="fs-8 border-bottom border-translucent pb-2 fw-bold">Reference Number</p>
                      <p class="fs-8 border-bottom border-translucent mt-2 pb-2" data-key="ReferenceNumber">
                        ${quoteReferenceNumber}
                      </p>
                    </div>
                    <div class="mt-4">
                      <p class="fs-8 border-bottom border-translucent pb-2 fw-bold">Client Name</p>
                      <p class="fs-8 border-bottom border-translucent mt-2 pb-2" data-key="ClientName">
                        ${quoteClientName}
                      </p>
                    </div>
                    <div class="mt-4">
                      <p class="fs-8 border-bottom border-translucent pb-2 fw-bold">Status</p>
                      <p class="fs-8 border-bottom border-translucent mt-2 pb-2" data-key="DocumentType">
                        ${quoteInfo.Status}
                      </p>
                    </div>
                    </div>
                    <div class="col-4">
                    <div class="mt-4">
                      <p class="fs-8 border-bottom border-translucent pb-2 fw-bold">Quote Type</p>
                      <p class="fs-8 border-bottom border-translucent mt-2 pb-2" data-key="DateUploaded">
                        ${quoteInfo.Context}
                      </p>
                    </div>
                </div>`;

      $('#quotesDataDiv').html(quoteDataHTML);
    },
    // initQuotesGrid: async (quoteUniqueGUID) => {

    //   const scope = _viewQuoteInfo;
    //   const fetchEDSDocument_result = await scope.fetchEDSDocument(quoteUniqueGUID);
    //   if (fetchEDSDocument_result) {

    //     const documentInfo = fetchEDSDocument_result;
    //     //populate grid
    //     scope.loadDocumentsGrid(documentInfo);
    //   }
    //   else {
    //     scope.GridMessageShow('No records found');
    //   }

    //   scope.documents = fetchEDSDocument_result;
    // },
    // fetchEDSDocument: async (quoteUniqueGUID) => {
    //   const scope = _viewQuoteInfo;
    //   const authTokenData = sessionStorage.getItem('AuthTokenData');

    //   if (!authTokenData) {
    //     _common.showError({
    //       type: 'swalToast',
    //       options: {
    //         icon: 'error',
    //         message: `Not Authenticated.`,
    //         position: 'bottom-right'
    //       }
    //     });
    //     return;
    //   }
    //   let AuthData = {};

    //   try {
    //     AuthData = JSON.parse(authTokenData);
    //   }
    //   catch (e) {
    //     _common.showError({
    //       type: 'swalToast',
    //       options: {
    //         icon: 'error',
    //         message: `Not Authenticated. ${e.message}`,
    //         position: 'bottom-right'
    //       }
    //     });
    //   }

    //   let policyHolderInfo = sessionStorage.getItem('PolicyHolderInfo');

    //   if (!policyHolderInfo) {
    //     _common.showError({
    //       type: 'swalToast',
    //       options: {
    //         icon: 'error',
    //         message: `No member info found`,
    //         position: 'bottom-right'
    //       }
    //     });

    //     scope.GridMessageShow('No member info found');
    //     return
    //   }

    //   try {
    //     policyHolderInfo = JSON.parse(policyHolderInfo);
    //     if (policyHolderInfo.constructor.name == 'Array') { //if array then use 1st record
    //       policyHolderInfo = policyHolderInfo[0];
    //     }
    //   }
    //   catch (e) {
    //     _common.showError({
    //       type: 'swalToast',
    //       options: {
    //         icon: 'error',
    //         message: `Unexpected value found for memberInfo.${e.message}`,
    //         position: 'bottom-right'
    //       }
    //     });

    //     scope.GridMessageShow(`Unexpected value found for memberInfo.${e.message}`);
    //     return
    //   }


    //   const searchEDSDocument_result = await _c360Api.searchEDSDocument({
    //     FileGUID: quoteUniqueGUID,
    //     PolicyMasterGUID: "00000000-0000-0000-0000-000000000000",
    //     AuthToken: AuthData.token,
    //     APIReferenceDataGUID: sessionStorage.C360APIReferenceDataGUID
    //   });

    //   if (!searchEDSDocument_result.Success) {

    //     let resultData = searchEDSDocument_result.Data;

    //     try {
    //       if (typeof(resultData) == 'string') {
    //         resultData = JSON.parse(resultData);
    //       }
    //     }
    //     catch (e) {}

    //     _common.showError({
    //       type: 'swalToast',
    //       options: {
    //         icon: 'error',
    //         message: `${resultData.responseFeedback}`,
    //         position: 'bottom-right'
    //       }
    //     });

    //     scope.GridMessageShow(`${resultData.responseFeedback}`);

    //     return;
    //   }

    //   return searchEDSDocument_result.Data.responseData[0];

    // },
    // loadDocumentsGrid: (documents) => {
    //   const scope = _viewQuoteInfo;
    //   if (!documents.length) {
    //     scope.GridMessageShow('No records found');
    //     $('#quotes-search-box').toggleClass('d-none', true);
    //     return;
    //   }

    //   const gridRowsHtml = documents.map((record) => {
    //     var image = '';

    //     switch (record.DocumentType.toLowerCase()) {
    //       case 'image':
    //         image = '&nbsp;<span class="far fa-file-image"></span>'
    //         break;
    //       case 'pdf':
    //         image = '&nbsp;<span class="far fa-file-pdf"></span>'
    //         break;
    //       case 'email':
    //         image = '&nbsp;<span class="far fa-envelope"></span>'
    //         break;
    //     }

    //     return ` <tr class="hover-actions-trigger btn-reveal-trigger position-static  grid-row" data-storage-guid="${record.StorageGUID}">
    //         <td class="date-time-uploaded align-middle fw-semibold pe-7 px-3 text-body-highlight">${record.DateUploaded} ${image}</td>
    //         <td class="type align-middle fw-semibold pe-7 text-body-highlight">${record.DocumentType}</td>
    //         <td class="document-name align-middle fw-semibold pe-7 text-body-highlight">${record.Title.length > 38 ? record.Title.substring(0, 38) + '...' : record.Title}</td>
    //         <td class="align-middle white-space-nowrap text-end pe-0 ps-5">
    //           <div class="btn-reveal-trigger position-static">
    //               <button class="btn btn-sm dropdown-toggle dropdown-caret-none transition-none btn-reveal fs-10" type="button" data-bs-toggle="dropdown" data-boundary="window" aria-haspopup="true" aria-expanded="false" data-bs-reference="parent"><svg class="svg-inline--fa fa-ellipsis fs-10" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="ellipsis" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="">
    //                       <path fill="currentColor" d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"></path>
    //                   </svg>
    //               </button>
    //               <div class="dropdown-menu dropdown-menu-end py-2">
    //                   <a class="dropdown-item" name="btnDownload" href="#!" data-storage-guid="${record.StorageGUID}">Download</a>
    //                   <a class="dropdown-item" name="btnsend" href="#!">Send</a>
    //               </div>
    //           </div>
    //       </td>
    //     </tr>`;
    //   }).join('');

    //   $('#claims-documents-grid-body').html(gridRowsHtml);

    //   setTimeout(() => {
    //     $('#claims-documents-grid-body tr[data-claim-guid],#claims-documents-grid-body a[name=btnView]').on('click', scope.documentsOffCanvas_onClick);
    //     $('#claims-documents-grid-body a[name=btnDownload]').on('click', scope.document_onClick);
    //     $('#claims-documents-grid-body a[name=btnsend]').on('click', scope.btnSendDocument_onClick);
    //     $('#claims-documents-grid-body tr[data-storage-guid] button.dropdown-toggle').on('click', (evt) => {
    //       evt.stopPropagation();
    //       evt.preventDefault();
    //       evt.cancelBubble = true;
    //     });

    //     if (documents.length) {
    //       _common.initTable({
    //         tableElementID: 'claimsDocumentsTable',
    //         searchFilterElementID: 'claimsDocumentsFilter',
    //         searchFilterColumns: ["date-time-uploaded", "type", "document-name"],
    //         sortableColumns: ["date-time-uploaded", "type", "document-name"],
    //         recordsPerPage: 5
    //       });
    //       $('#claims-document-search-box').toggleClass('d-none', false);
    //     }
    //   }, 150);

    // },
    // btnSendDocument_onClick: (evt) => {
    //   evt.stopPropagation();
    //   evt.preventDefault();
    //   evt.cancelBubble = true;

    //   const scope = _viewQuoteInfo;
    //   const gridRowElement = evt.currentTarget;
    //   const storageGUID = $(gridRowElement).closest('tr').data().storageGuid || '';
    //   const DocumentRecord = scope.documents.find('StorageGUID', storageGUID);
    //   // const policyGUID = $(evt.currentTarget).closest('tr').data().policyGuid;

    //   _appRouter.routeTo('send_document', true, {
    //     policies: '',
    //     DocumentsData: DocumentRecord
    //     // policyGUID
    //   });
    // },
    document_onClick: async (evt) => {
      evt.stopPropagation();
      evt.preventDefault();
      evt.cancelBubble = true;
      const scope = _viewQuoteInfo;
      const gridRowElement = evt.currentTarget;
      const storageGUID = $(gridRowElement).data().storageGuid;


      const authTokenData = sessionStorage.getItem('AuthTokenData');

      if (!authTokenData) {
        _common.showError({
          type: 'swalToast',
          options: {
            icon: 'error',
            message: `Not Authenticated.`,
            position: 'bottom-right'
          }
        });
        return;
      }
      let AuthData = {};

      try {
        AuthData = JSON.parse(authTokenData);
      }
      catch (e) {
        _common.showError({
          type: 'swalToast',
          options: {
            icon: 'error',
            message: `Not Authenticated. ${e.message}`,
            position: 'bottom-right'
          }
        });
      }

      const downloadEDSDocument_result = await _c360Api.downloadEDSDocument({
        StorageGUID: storageGUID,
        AuthToken: AuthData.token,
        APIReferenceDataGUID: sessionStorage.C360APIReferenceDataGUID
      });

      if (!downloadEDSDocument_result.Success) {

        let resultData = downloadEDSDocument_result.Data;

        try {
          if (typeof(resultData) == 'string') {
            resultData = JSON.parse(resultData);
          }
        }
        catch (e) {}

        _common.showError({
          type: 'swalToast',
          options: {
            icon: 'error',
            message: `${resultData.responseFeedback}`,
            position: 'bottom-right'
          }
        });
        return;
      }

      console.log('downloadEDSDocument_result', downloadEDSDocument_result);
      const fileData = downloadEDSDocument_result.Data.responseData[0][0] || {};
      const fileName = fileData.filename;
      const fileNameArray = fileName.split('.');
      const FileNameArrayLength = fileNameArray.length;
      const fileExtention = '.' + fileNameArray[(FileNameArrayLength - 1)];
      const mimeType = _common.getMimeType(fileExtention);

      if (!mimeType) {
        _common.showError({
          type: 'swalToast',
          options: {
            icon: 'error',
            message: `Unable to download file as MIME Type for "${fileExtention}" is not supported.`,
            position: 'bottom-right'
          }
        });
        return;
      }

      const fileBase64Data = 'data:' + mimeType + ';base64,' + fileData.DocumentDataBase64;

      download(fileBase64Data, fileName);

      var arrBuffer = scope.base64ToArrayBuffer(fileData.DocumentDataBase64);
      var newBlob = new Blob([arrBuffer], { type: mimeType });

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(newBlob);
        return;
      }

      var data = window.URL.createObjectURL(newBlob);
      window.open(data);
    },
    // base64ToArrayBuffer: (data) => {
    //   var binaryString = window.atob(data);
    //   var binaryLen = binaryString.length;
    //   var bytes = new Uint8Array(binaryLen);
    //   for (var i = 0; i < binaryLen; i++) {
    //     var ascii = binaryString.charCodeAt(i);
    //     bytes[i] = ascii;
    //   }
    //   return bytes;
    // },
    GridMessageShow: (Message) => {
      $('#claimsDocumentsNotificationDiv').html(Message);
      $('#claimsDocumentsNotificationDiv').show();
      $('#claimsDocumentsFilterDiv').hide();
      $('#claimsDocumentsTable').hide();
    },
    closeCanvas: (evt) => {

      try {

        if (typeof _quotes !== 'undefined' && _quotes.activeFile == 'true') {
          _quotes.closeCanvas();
        }
        else {
          _quotesexpanded.closeCanvas();
        }
      }
      catch (e) {
        _common.showError({
          type: 'swalToast',
          options: {
            icon: 'error',
            message: `_viewQuoteInfo.closeCanvas.${e.message}`,
            position: 'bottom-right'
          }
        });
      }
    }
  }
}();
_viewQuoteInfo.init();
