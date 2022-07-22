import mongoose from "mongoose";
export default class MongooseService<T, Tstructure> {
    model: mongoose.Model<T>;
    constructor(model: mongoose.Model<T>);
    /**
     * @description Create a new document on the Model
     * @param pipeline {array} Aggregate pipeline to execute
     * @returns {Promise} Returns the results of the query
     */
    aggregate(pipeline: any[]): Promise<any[]>;
    /**
     * @description Create a new document on the Model
     * @param body {object} Body object to create the new document with
     * @returns {Promise} Returns the results of the query
     */
    create(body: Tstructure): Promise<mongoose.HydratedDocument<T, {}, {}>>;
    /**
     * @description Count the number of documents matching the query criteria
     * @param query {object} Query to be performed on the Model
     * @returns {Promise} Returns the results of the query
     */
    count(query: mongoose.QueryOptions): Promise<number>;
    /**
     * @description Delete an existing document on the Model
     * @param id {string} ID for the object to delete
     * @returns {Promise} Returns the results of the query
     */
    delete(id: string): Promise<mongoose.HydratedDocument<T, {}, {}> | null>;
    /**
     * @description Delete an existing document on the Model
     * @param id {string} ID for the object to delete
     * @returns {Promise} Returns the results of the query
     */
    deleteMany(filter: mongoose.QueryOptions): Promise<import("mongodb").DeleteResult>;
    /**
     * @description Retrieve distinct "fields" which are in the provided status
     * @param query {object} Object that maps to the status to retrieve docs for
     * @param field {string} The distinct field to retrieve
     * @returns {Promise} Returns the results of the query
     */
    findDistinct(query: mongoose.QueryOptions, field: string): Promise<any[]>;
    /**
     * @description Retrieve distinct "fields" which are in the provided status
     * @param query {object} Object that maps to the status to retrieve docs for
     * @returns {Promise} Returns the results of the query
     */
    find(query: mongoose.QueryOptions): Promise<any>;
    /**
     * @description Retrieve a single document from the Model with the provided
     *   query
     * @param query {object} Query to be performed on the Model
     * @param {object} [projection] Optional: Fields to return or not return from
     * query
     * @param {object} [options] Optional options to provide query
     * @returns {Promise} Returns the results of the query
     */
    findOne(query: mongoose.QueryOptions, options?: mongoose.QueryOptions): Promise<mongoose.HydratedDocument<T, {}, {}> | null>;
    /**
     * @description Retrieve a single document matching the provided ID, from the
     *   Model
     * @param id {string} Required: ID for the object to retrieve
     * @returns {Promise} Returns the results of the query
     */
    findById(id: string): Promise<mongoose.HydratedDocument<T, {}, {}> | null>;
    /**
     * @description Update a document matching the provided ID, with the body
     * @param id {string} ID for the document to update
     * @param body {object} Body to update the document with
     * @param {object} [options] Optional options to provide query
     * @returns {Promise} Returns the results of the query
     */
    update(id: string, body: Partial<Tstructure>, options?: {
        lean: boolean;
        new: boolean;
    }): Promise<mongoose.HydratedDocument<T, {}, {}> | null>;
    /**
     *  @description Updates a document partially
     * @param filter {mongoose.FilterQuery} filter to find the document
     * @param expression {expression} expression to update document partially
     */
    partialUpdate(filter: mongoose.FilterQuery<Partial<Tstructure>>, expression: any, options?: {
        new: boolean;
    }): Promise<mongoose.HydratedDocument<T, {}, {}> | null>;
}
