'use strict';

const api = (function() {
	const create = function(path, obj) {
		return $.ajax({
			type: 'POST',
			url: path,
			contentType: 'application/json',
			dataType: 'json',
			processData: false,
			data: JSON.stringify(obj),
			headers: { Authorization: `Bearer ${store.authToken}` }
		});
  };
  
	const upload = function(path, obj) {
		 return $.ajax({
			type: 'POST',
      url: path,
      contentType: false,
      dataType: 'json',
      processData: false,
      cache: false,
      data: obj,
      headers: { 
        Authorization: `Bearer ${store.authToken}`,
      }
    });
  };
  
	const search = function(path, query) {
		return $.ajax({
			type: 'GET',
			url: path,
			dataType: 'json',
			data: query,
			headers: { Authorization: `Bearer ${store.authToken}` }
		});
  };
  
	const update = function(path, obj) {
		return $.ajax({
			type: 'PUT',
			url: path,
			contentType: 'application/json',
			data: JSON.stringify(obj),
			headers: { Authorization: `Bearer ${store.authToken}` }
		});
  };
  
	const remove = function(path) {
		return $.ajax({
			type: 'DELETE',
			dataType: 'json',
			url: path,
			headers: { Authorization: `Bearer ${store.authToken}` }
		});
  };
  
	return {
    create,
    upload,
		update,
		remove,
		search
	};
})();
