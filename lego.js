'use strict';

var isStar = true;

var queryInfo = {
    friends: [],
    copyFriendList: [],
    trueFriends: [],
    currentData: '',
    properties: [],
    limit: ''
};

var operations = {
    selectOp: function (func) {
        queryInfo.properties = func();
    },

    filterInOp: function (func) {
        queryInfo.friends = func();
    },

    sortByOp: function (func) {
        queryInfo.friends = func();
    },

    formatOp: function (func) {
        queryInfo.friends.forEach(function (friend, i) {
            queryInfo.currentData = queryInfo.friends[i];
            var formatOperation = func();
            friend[formatOperation.property] = formatOperation.value;
        });
    },

    limitOp: function (func) {
        queryInfo.limit = func();
    },

    andOp: function (func) {
        queryInfo.friends = func();
    },

    orOp: function (func) {
        queryInfo.friends = func();
    }
};

/**
 * Запрос к коллекции
 * @param {Array} collection
 * @params {...Function} – Функции для запроса
 * @returns {Array}
 */
function query(collection) {
    if (arguments.length === 1) {
        return getCopyCollection(collection);
    }

    refreshQueryInfo(collection);

    callQueryOperations(getFunctions(arguments));

    formatTrueFriendsInfo();

    return queryInfo.trueFriends;
}

/**
 * Выбор полей
 * @params {...String}
 * @returns {function}
 */
function select() {
    var fields = arguments;

    return function selectOp() {
        if (queryInfo.properties.length === 0) {
            return [].filter.call(fields, function (field) {
                return queryInfo.friends[0].hasOwnProperty(field);
            });
        }

        return queryInfo.properties.concat([].filter.call(fields, function (field) {
            return isFieldSuit(field);
        }));
    };
}

/**
 * Фильтрация поля по массиву значений
 * @param {String} property – Свойство для фильтрации
 * @param {Array} values – Доступные значения
 * @returns {function}
 */
function filterIn(property, values) {
    console.info(property, values);

    return function filterInOp() {
        return queryInfo.friends.filter(function (friend) {
            return values.some(function (value) {
                return friend[property] === value;
            });
        });
    };
}

/**
 * Сортировка коллекции по полю
 * @param {String} property – Свойство для фильтрации
 * @param {String} order – Порядок сортировки (asc - по возрастанию; desc – по убыванию)
 * @returns {function}
 */
function sortBy(property, order) {
    console.info(property, order);

    return function sortByOp() {
        if (order === 'asc') {
            return queryInfo.friends.sort(function (friend1, friend2) {
                if (friend1[property] > friend2[property]) {
                    return 1;
                }

                if (friend1[property] < friend2[property]) {
                    return -1;
                }

                return 0;
            });
        }

        return queryInfo.friends.sort(function (friend1, friend2) {
            if (friend1[property] < friend2[property]) {
                return 1;
            }

            if (friend1[property] > friend2[property]) {
                return -1;
            }

            return 0;
        });
    };
}

/**
 * Форматирование поля
 * @param {String} property – Свойство для фильтрации
 * @param {Function} formatter – Функция для форматирования
 * @returns {function}
 */
function format(property, formatter) {
    console.info(property, formatter);

    return function formatOp() {
        return {
            property: property,
            value: formatter(queryInfo.currentData[property].toString())
        };
    };
}

/**
 * Ограничение количества элементов в коллекции
 * @param {Number} count – Максимальное количество элементов
 * @returns {function}
 */
function limit(count) {
    console.info(count);

    return function limitOp() {
        return count;
    };
}

/**
 * Фильтрация, объединяющая фильтрующие функции
 * @star
 * @params {...Function} – Фильтрующие функции
 * @returns {function}
 */
function or() {
    var functions = arguments;

    return function orOp() {
        var result = [];
        [].forEach.call(functions, function (func) {
            result = result.concat(func().filter(function (friend) {
                return !result.includes(friend);
            }));
        });

        return result;
    };
}

/**
 * Фильтрация, пересекающая фильтрующие функции
 * @star
 * @params {...Function} – Фильтрующие функции
 * @returns {function}
 */
function and() {
    var functions = arguments;

    return function andOp() {
        queryInfo.friends = getCopyCollection(queryInfo.copyFriendList);
        [].forEach.call(functions, function (func) {
            queryInfo.friends = func();
        });

        return queryInfo.friends;
    };
}

function getCopyCollection(collection) {
    var copyInfo;

    return collection.map(function (friend) {
        copyInfo = {};
        for (var field in friend) {
            if (!friend.hasOwnProperty(field)) {
                return null;
            }

            copyInfo[field] = friend[field];
        }

        return copyInfo;
    });
}

function refreshQueryInfo(collection) {
    queryInfo = getNewQueryInfo();
    queryInfo.friends = getCopyCollection(collection);
    queryInfo.copyFriendList = getCopyCollection(collection);
    queryInfo.limit = queryInfo.friends.length;
}

function callQueryOperations(functions) {
    functions.forEach(function (func) {
        callSpecifiedOperation(func);
    });
}

function formatTrueFriendsInfo() {
    queryInfo.friends.every(function (friend, i) {
        if (i === queryInfo.limit) {
            return false;
        }

        var trueFriend = {};
        queryInfo.properties.forEach(function (property) {
            trueFriend[property] = friend[property];
        });

        queryInfo.trueFriends.push(trueFriend);

        return true;
    });
}

function getFunctions(args) {
    return [].slice.call(args, 1);
}

function getNewQueryInfo() {
    return {
        friends: [],
        copyFriendList: [],
        trueFriends: [],
        currentData: '',
        properties: [],
        limit: ''
    };
}

function callSpecifiedOperation(func) {
    operations[func.name](func);
}

function isFieldSuit(field) {
    return queryInfo.friends[0].hasOwnProperty(field) &&
        !queryInfo.properties.includes(field);
}

/**
 * Сделано задание на звездочку
 * Реализованы методы or и and
 */
exports.isStar = isStar;
exports.query = query;
exports.select = select;
exports.filterIn = filterIn;
exports.sortBy = sortBy;
exports.format = format;
exports.limit = limit;
exports.or = or;
exports.and = and;
