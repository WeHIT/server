'use strict';

module.exports = app => {
  class PtSaleController extends app.Controller {
    * index() {
      // yield this.service.ptSale.getPtSalePostList();
      yield this.service.ptSale.saveToDb();
    }
  }
  return PtSaleController;
};
