"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// type T = typeof User
class MongooseService {
    constructor(model) {
        this.model = model;
    }
    /**
     * @description Create a new document on the Model
     * @param pipeline {array} Aggregate pipeline to execute
     * @returns {Promise} Returns the results of the query
     */
    aggregate(pipeline) {
        return this.model.aggregate(pipeline).exec();
    }
    /**
     * @description Create a new document on the Model
     * @param body {object} Body object to create the new document with
     * @returns {Promise} Returns the results of the query
     */
    create(body) {
        return this.model.create(body);
    }
    /**
     * @description Count the number of documents matching the query criteria
     * @param query {object} Query to be performed on the Model
     * @returns {Promise} Returns the results of the query
     */
    count(query) {
        return this.model.count(query).exec();
    }
    /**
     * @description Delete an existing document on the Model
     * @param id {string} ID for the object to delete
     * @returns {Promise} Returns the results of the query
     */
    delete(id) {
        return this.model.findByIdAndDelete(id).exec();
    }
    /**
     * @description Retrieve distinct "fields" which are in the provided status
     * @param query {object} Object that maps to the status to retrieve docs for
     * @param field {string} The distinct field to retrieve
     * @returns {Promise} Returns the results of the query
     */
    findDistinct(query, field) {
        return this.model.find(query).distinct(field).exec();
    }
    /**
     * @description Retrieve distinct "fields" which are in the provided status
     * @param query {object} Object that maps to the status to retrieve docs for
     * @returns {Promise} Returns the results of the query
     */
    find(query) {
        return this.model.find(query).exec();
    }
    /**
     * @description Retrieve a single document from the Model with the provided
     *   query
     * @param query {object} Query to be performed on the Model
     * @param {object} [projection] Optional: Fields to return or not return from
     * query
     * @param {object} [options] Optional options to provide query
     * @returns {Promise} Returns the results of the query
     */
    findOne(query, projection = { __v: 0 }, options = { lean: true }) {
        return this.model
            .findOne(query, projection, options)
            .select({ __v: 0 })
            .exec();
    }
    /**
     * @description Retrieve a single document matching the provided ID, from the
     *   Model
     * @param id {string} Required: ID for the object to retrieve
     * @param {object} [projection] Optional: Fields to return or not return from
     * query
     * @param {object} [options] Optional: options to provide query
     * @returns {Promise} Returns the results of the query
     */
    findById(id, projection = { __v: 0 }, options = { lean: true }) {
        return this.model.findById(id, projection, options).exec();
    }
    /**
     * @description Update a document matching the provided ID, with the body
     * @param id {string} ID for the document to update
     * @param body {object} Body to update the document with
     * @param {object} [options] Optional options to provide query
     * @returns {Promise} Returns the results of the query
     */
    update(id, body, options = { lean: true, new: true }) {
        return this.model.findByIdAndUpdate(id, body, options).exec();
    }
    /**
     *  @description Updates a document partially
     * @param filter {mongoose.FilterQuery} filter to find the document
     * @param expression {expression} expression to update document partially
     */
    partialUpdate(filter, expression, options = { new: true }) {
        return this.model.findOneAndUpdate(filter, expression, options).exec();
    }
}
exports.default = MongooseService;
