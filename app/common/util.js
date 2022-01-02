"use strict";
const _ = require('lodash');

module.exports = {
  getPagination: (pageNumber, pageSize, totalRecords) => {
   
    return {
      pageNumber : parseInt(pageNumber),
      pageSize   : parseInt(pageSize),
      totalCount : totalRecords,
      totalPages : _.ceil(totalRecords / pageSize),
      isFirst    : parseInt(pageNumber) == 1,
      isLast     : _.ceil(totalRecords / pageSize) == pageNumber,
    };
  }
};
