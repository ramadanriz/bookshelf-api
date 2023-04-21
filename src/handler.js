const { nanoid } = require('nanoid')
const books = require('./books')

const addBookHandler = (request, h) => {
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload
  const id = nanoid(16)
  const insertedAt = new Date().toISOString()
  const updatedAt = insertedAt
  const finished = pageCount === readPage
  const newBook = { id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt }

  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku'
    })
    response.code(400)
    return response
  }
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
    })
    response.code(400)
    return response
  }
  books.push(newBook)
  const isSuccess = books.filter((book) => book.id === id).length > 0

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id
      }
    })
    response.code(201)
    return response
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan'
  })
  response.code(500)
  return response
}

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query
  const getResponse = (booksFiltered) => {
    const booksMaped = booksFiltered.map((book) => {
      const { id, name, publisher } = book
      return { id, name, publisher }
    })
    const response = {
      status: 'success',
      data: {
        books: booksMaped
      }
    }
    return response
  }
  if (name) {
    const search = name.toLowerCase()
    const book = books.filter(book => book.name.toLowerCase().includes(search))
    return getResponse(book)
  }
  if (reading) {
    const read = reading === '1'
    return getResponse(books.filter((book) => book.reading === read))
  }
  if (finished) {
    const finish = finished === '1'
    return getResponse(books.filter((book) => book.finished === finish))
  }

  const response = h.response({
    status: 'success',
    data: {
      books: books.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher
      }))
    }
  })
  response.code(200)
  return response
}

const getDetailBookHandler = (request, h) => {
  const { bookId } = request.params
  const book = books.filter((n) => n.id === bookId)[0]

  if (book) {
    const response = h.response({
      status: 'success',
      data: {
        book
      }
    })
    response.code(200)
    return response
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan'
  })
  response.code(404)
  return response
}

const editBookHandler = (request, h) => {
  const { bookId } = request.params
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload
  const updatedAt = new Date().toISOString()
  const index = books.findIndex((book) => book.id === bookId)

  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku'
    })
    response.code(400)
    return response
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
    })
    response.code(400)
    return response
  }

  if (index !== -1) {
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
    }
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui'
    })
    response.code(200)
    return response
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan'
  })
  response.code(404)
  return response
}

const deleteBookHandler = (request, h) => {
  const { bookId } = request.params
  const index = books.findIndex((book) => book.id === bookId)

  if (index !== -1) {
    books.splice(index, 1)
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus'
    })
    response.code(200)
    return response
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan'
  })
  response.code(404)
  return response
}

module.exports = { addBookHandler, getAllBooksHandler, getDetailBookHandler, editBookHandler, deleteBookHandler }
