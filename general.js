// ===============================
// ULTRA ADVANCED BOOK API CLIENT (FINAL FIXED)
// ===============================

const axios = require('axios');

// ===============================
// CONFIG (IBM App Endpoint Base URL)
// ===============================
const CONFIG = {
    BASE_URL: 'http://localhost:5000',
    TIMEOUT: 5000,
    RETRY_LIMIT: 3,
};

// ===============================
// UTILS
// ===============================
const Utils = {
    validateString(value, name) {
        if (!value || typeof value !== 'string' || value.trim() === '') {
            throw new Error(`${name} must be a non-empty string`);
        }
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// ===============================
// STANDARD RESPONSE FORMAT
// ===============================
const Response = (success, message, data = null) => {
    return { success, message, data };
};

// ===============================
// MAIN CLASS
// ===============================
class BookAPI {
    constructor(config) {
        this.config = config;
    }

    // ===============================
    // RETRY + ERROR HANDLING
    // ===============================
    async requestWithRetry(url, attempt = 1) {
        try {
            const res = await axios.get(url, { timeout: this.config.TIMEOUT });
            return res.data;
        } catch (error) {
            if (attempt < this.config.RETRY_LIMIT) {
                await Utils.delay(1000 * attempt);
                return this.requestWithRetry(url, attempt + 1);
            }

            // FINAL ERROR HANDLING
            if (error.response) {
                throw new Error(`Server Error: ${error.response.status}`);
            } else if (error.request) {
                throw new Error("No response from server");
            } else {
                throw new Error(error.message);
            }
        }
    }

    // ===============================
    // GET ALL BOOKS (Endpoint: /)
    // ===============================
    async getAllBooks() {
        try {
            const url = `${this.config.BASE_URL}/`;
            const data = await this.requestWithRetry(url);

            const books = data.books ? data.books : data;

            if (!books || Object.keys(books).length === 0) {
                return Response(false, "No books available");
            }

            return Response(true, "Books retrieved successfully", books);

        } catch (err) {
            return Response(false, err.message);
        }
    }

    // ===============================
    // GET BY ISBN (Endpoint: /isbn/:isbn)
    // ===============================
    async getBookByISBN(isbn) {
        try {
            Utils.validateString(isbn, "ISBN");

            const url = `${this.config.BASE_URL}/isbn/${isbn}`;
            const data = await this.requestWithRetry(url);

            if (!data || Object.keys(data).length === 0) {
                return Response(false, "Book not found");
            }

            return Response(true, "Book retrieved successfully", data);

        } catch (err) {
            return Response(false, err.message);
        }
    }

    // ===============================
    // GET BY AUTHOR (Endpoint: /author/:author)
    // ===============================
    async getBooksByAuthor(author) {
        try {
            Utils.validateString(author, "Author");

            const url = `${this.config.BASE_URL}/author/${encodeURIComponent(author)}`;
            const data = await this.requestWithRetry(url);

            if (!data || Object.keys(data).length === 0) {
                return Response(false, "No books found for this author");
            }

            return Response(true, "Books retrieved successfully", data);

        } catch (err) {
            return Response(false, err.message);
        }
    }

    // ===============================
    // GET BY TITLE (Endpoint: /title/:title)
    // ===============================
    async getBooksByTitle(title) {
        try {
            Utils.validateString(title, "Title");

            const url = `${this.config.BASE_URL}/title/${encodeURIComponent(title)}`;
            const data = await this.requestWithRetry(url);

            if (!data || Object.keys(data).length === 0) {
                return Response(false, "No books found for this title");
            }

            return Response(true, "Books retrieved successfully", data);

        } catch (err) {
            return Response(false, err.message);
        }
    }
}

// ===============================
// PROMISE VERSION (Task 10-13 Requirements)
// ===============================
function getAllBooksPromise() {
    return new Promise((resolve) => {
        axios.get(`${CONFIG.BASE_URL}/`)
            .then(res => {
                const books = res.data.books ? res.data.books : res.data;
                if (!books || Object.keys(books).length === 0) {
                    resolve(Response(false, "No books available"));
                } else {
                    resolve(Response(true, "Books retrieved successfully", books));
                }
            })
            .catch(err => resolve(Response(false, err.message)));
    });
}

// ===============================
// EXPORT
// ===============================
module.exports = {
    BookAPI,
    getAllBooksPromise
};