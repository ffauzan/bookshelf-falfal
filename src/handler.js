const {nanoid} = require('nanoid');
const books = require('./books');

const allBookDebug = (req, h) => {
    const res = h.response({
        status: 'success',
        data: {
            "books": books,
        },
    });

    res.code(200);
    return res;
};

const addBookHandler = (req, h) => {
    // Read payload
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = req.payload;

    // Payload value validation

    // No name
    if(name === undefined) {
        const res = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. Mohon isi nama buku',
        });
        res.code(400);
        return res;
    }

    // Read page count
    if(readPage > pageCount) {
        const res = h.response({
            status: 'fail',
            message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
        });
        res.code(400);
        return res;
    }

    // Attr that need computing
    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    // Check is finished reading based on readPage
    let finished = false;
    if(readPage === pageCount) {
        finished = true;
    }

    // Create new book object
    const newBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt
    };

    // Add it to shelf
    books.push(newBook);

    // Check if the book is successfully added to the shelf
    const isSuccess =  books.filter((book) => book.id === id).length > 0;

    // Successful respons
    if(isSuccess) {
        const res = h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: id,
            },
        });
        res.code(201);
        return res;
    }

    // Failed respons
    const res = h.response({
        status: 'error',
        message: 'Buku gagal ditambahkan',
    });
    res.code(500);
    return res;

};

const getAllBooksHandler = (req, h) => {

    // Get url encoded query
    const {name, reading, finished} = req.query;

    // Show all books if no query
    if(name === undefined && reading === undefined && finished === undefined) {
        const returnData = books.map(({id, name, publisher}) => ({
            id,
            name,
            publisher
        }));
    
        const res = h.response({
            status: 'success',
            data: {
                "books": returnData,
            },
        });
    
        res.code(200);
        return res;
    } ;

    // Filter by name function
    const filterName = (books, name) => {
        return books.filter((book) => (book.name).toLowerCase().includes(name.toLowerCase()));
    };

    // Filter by finished function
    const filterFinished = (books, isFinished) => {
        if (isFinished == 1) {
            return books.filter((book) => book.finished === true);
        } else if(isFinished == 0) {
            return books.filter((book) => book.finished === false);
        } else {
            return books;
        };
    };

    // Filter by reading function
    const filterReading = (books, isReading) => {
        if (isReading == 1) {
            return books.filter((book) => book.reading === true);
        } else if(isReading == 0) {
            return books.filter((book) => book.reading === false);
        } else {
            return books;
        };
    };

    let returnData = books;

    // Call all filter function
    if(name !== undefined) {
        returnData = filterName(returnData, name);
    }

    else if(finished !== undefined) {
        returnData = filterFinished(returnData, finished);
    }

    else if(reading !== undefined) {
        returnData = filterReading(returnData, reading);
    }

    // Format data to match requirement
    returnData = returnData.map(({id, name, publisher}) => ({
        id,
        name,
        publisher
    }));

    // Format response to match requirement
    const res = h.response({
        status: 'success',
        data: {
            "books": returnData,
        },
    });

    res.code(200);
    return res;

    
};

const getBookByIdHandler = (req, h) => {
    // Get param
    const {bookId} = req.params;
    const book = books.filter((book) => book.id === bookId)[0];

    // When param is present
    if(book !== undefined) {
        const res = h.response({
            status: 'success',
            data: {
                book
            },
        });

        res.code(200);
        return res;

    } else {
        // When no param
        const res = h.response({
            status: 'fail',
            message: 'Buku tidak ditemukan',
        });

        res.code(404);
        return res;
    }
};

const editBookByIdHandler = (req, h) => {
    // Get param
    const {bookId} = req.params;
    const index = books.findIndex((book) => book.id === bookId);

    // When the book with requested id not found
    if(index === -1) {
        const res = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Id tidak ditemukan',
        });

        res.code(404);
        return res;
    }

    // Get data from payload
    const {
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
    } = req.payload;

    const updatedAt = new Date().toISOString();

    // No name
    if(name === undefined) {
        const res = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. Mohon isi nama buku',
        });
        res.code(400);
        return res;
    };

    // Read page count
    if(readPage > pageCount) {
        const res = h.response({
            status: 'fail',
            message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
        });
        res.code(400);
        return res;
    };

    // Pass all validation
    books[index] = {
        ...books[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        updatedAt
    };

    const res = h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui'
    });
    res.code(200);
    return res;

};

const deleteBookByIdHandler = (req, h) => {

    const {bookId} = req.params;
    const index = books.findIndex((book) => book.id === bookId);

    // When the book with requested id not found
    if(index === -1) {
        const res = h.response({
            status: 'fail',
            message: 'Buku gagal dihapus. Id tidak ditemukan',
        });

        res.code(404);
        return res;
    } else {
        // Deleting process
        books.splice(index, 1);

        const res = h.response({
            status: 'success',
            message: 'Buku berhasil dihapus'
        });
        res.code(200);
        return res;
    }


};

module.exports = {
    addBookHandler,
    getAllBooksHandler,
    getBookByIdHandler,
    editBookByIdHandler,
    deleteBookByIdHandler,
    allBookDebug
};