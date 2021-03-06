$(function () {
    //牵扯到国际化这些常量在页面加载后再生效
    // full day names
    Date._DN = [BI.i18nText("BI-Basic_Sunday"),
        BI.i18nText("BI-Basic_Monday"),
        BI.i18nText("BI-Basic_Tuesday"),
        BI.i18nText("BI-Basic_Wednesday"),
        BI.i18nText("BI-Basic_Thursday"),
        BI.i18nText("BI-Basic_Friday"),
        BI.i18nText("BI-Basic_Saturday"),
        BI.i18nText("BI-Basic_Sunday")];

    // short day names
    Date._SDN = [BI.i18nText("BI-Basic_Simple_Sunday"),
        BI.i18nText("BI-Basic_Simple_Monday"),
        BI.i18nText("BI-Basic_Simple_Tuesday"),
        BI.i18nText("BI-Basic_Simple_Wednesday"),
        BI.i18nText("BI-Basic_Simple_Thursday"),
        BI.i18nText("BI-Basic_Simple_Friday"),
        BI.i18nText("BI-Basic_Simple_Saturday"),
        BI.i18nText("BI-Basic_Simple_Sunday")];

    // Monday first, etc.
    Date._FD = 1;

    // full month namesdat
    Date._MN = [
        BI.i18nText("BI-Basic_January"),
        BI.i18nText("BI-Basic_February"),
        BI.i18nText("BI-Basic_March"),
        BI.i18nText("BI-Basic_April"),
        BI.i18nText("BI-Basic_May"),
        BI.i18nText("BI-Basic_June"),
        BI.i18nText("BI-Basic_July"),
        BI.i18nText("BI-Basic_August"),
        BI.i18nText("BI-Basic_September"),
        BI.i18nText("BI-Basic_October"),
        BI.i18nText("BI-Basic_November"),
        BI.i18nText("BI-Basic_December")];

    // short month names
    Date._SMN = [0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11];

    Date._QN = ["", BI.i18nText("BI-Quarter_1"),
        BI.i18nText("BI-Quarter_2"),
        BI.i18nText("BI-Quarter_3"),
        BI.i18nText("BI-Quarter_4")];

    /** Adds the number of days array to the Date object. */
    Date._MD = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
})

/** Constants used for time computations */
Date.SECOND = 1000 /* milliseconds */;
Date.MINUTE = 60 * Date.SECOND;
Date.HOUR = 60 * Date.MINUTE;
Date.DAY = 24 * Date.HOUR;
Date.WEEK = 7 * Date.DAY;

/**
 * 获取时区
 * @returns {String}
 */
Date.prototype.getTimezone = function () {
    return this.toString().replace(/^.* (?:\((.*)\)|([A-Z]{1,4})(?:[\-+][0-9]{4})?(?: -?\d+)?)$/, "$1$2").replace(/[^A-Z]/g, "");
};

/** Returns the number of days in the current month */
Date.prototype.getMonthDays = function (month) {
    var year = this.getFullYear();
    if (typeof month == "undefined") {
        month = this.getMonth();
    }
    if (((0 == (year % 4)) && ( (0 != (year % 100)) || (0 == (year % 400)))) && month == 1) {
        return 29;
    } else {
        return Date._MD[month];
    }
};

/**
 * 获取每月的最后一天
 * @returns {Date}
 */
Date.prototype.getLastDateOfMonth = function () {
    return Date.getDate(this.getFullYear(), this.getMonth(), this.getMonthDays());
};

/** Returns the number of day in the year. */
Date.prototype.getDayOfYear = function () {
    var now = Date.getDate(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
    var then = Date.getDate(this.getFullYear(), 0, 0, 0, 0, 0);
    var time = now - then;
    return Math.floor(time / Date.DAY);
};

/** Returns the number of the week in year, as defined in ISO 8601. */
Date.prototype.getWeekNumber = function () {
    var d = Date.getDate(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
    //周一是一周第一天
    var week = d.getDay() === 0 ? 7 : d.getDay();
    //var week = d.getDay();
    if (this.getMonth() === 0 && this.getDate() <= week) {
        return 1;
    }
    d.setDate(this.getDate() - (week - 1));
    var ms = d.valueOf(); // GMT
    d.setMonth(0);
    d.setDate(1);
    var offset = Math.floor((ms - d.valueOf()) / (7 * 864e5)) + 1;
    if (d.getDay() !== 1) {
        offset++;
    }
    return offset;
};

Date.prototype.getQuarter = function () {
    return Math.floor(this.getMonth() / 3) + 1;
};

//离当前时间多少天的时间
Date.prototype.getOffsetDate = function (offset) {
    return Date.getDate(Date.getTime(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds()) + offset * 864e5);
};

Date.prototype.getAfterMulQuarter = function (n) {
    var dt = Date.getDate(Date.getTime(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds()));
    dt.setMonth(dt.getMonth() + n * 3);
    return dt;
};
//获得n个季度前的日期
Date.prototype.getBeforeMulQuarter = function (n) {
    var dt = Date.getDate(Date.getTime(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds()));
    dt.setMonth(dt.getMonth() - n * 3);
    return dt;
};
//得到本季度的起始月份
Date.prototype.getQuarterStartMonth = function () {
    var quarterStartMonth = 0;
    var nowMonth = this.getMonth();
    if (nowMonth < 3) {
        quarterStartMonth = 0;
    }
    if (2 < nowMonth && nowMonth < 6) {
        quarterStartMonth = 3;
    }
    if (5 < nowMonth && nowMonth < 9) {
        quarterStartMonth = 6;
    }
    if (nowMonth > 8) {
        quarterStartMonth = 9;
    }
    return quarterStartMonth;
};
//获得本季度的起始日期
Date.prototype.getQuarterStartDate = function () {
    return Date.getDate(this.getFullYear(), this.getQuarterStartMonth(), 1);
};
//得到本季度的结束日期
Date.prototype.getQuarterEndDate = function () {
    var quarterEndMonth = this.getQuarterStartMonth() + 2;
    return Date.getDate(this.getFullYear(), quarterEndMonth, this.getMonthDays(quarterEndMonth));
};
Date.prototype.getAfterMultiMonth = function (n) {
    var dt = Date.getDate(Date.getTime(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds()));
    dt.setMonth(dt.getMonth() + n | 0);
    return dt;
};
Date.prototype.getBeforeMultiMonth = function (n) {
    var dt = Date.getDate(Date.getTime(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds()));
    dt.setMonth(dt.getMonth() - n | 0);
    return dt;
};

//指定日期n个月之前或之后的日期
Date.prototype.getOffsetMonth = function (n) {
    var dt = Date.getDate(Date.getTime(this.getFullYear(), this.getMonth(), this.getDate(), this.getHours(), this.getMinutes(), this.getSeconds()));
    var day = dt.getDate();
    var monthDay = Date.getDate(dt.getFullYear(), dt.getMonth() + parseInt(n), 1).getMonthDays();
    if (day > monthDay) {
        day = monthDay;
    }
    dt.setDate(day);
    dt.setMonth(dt.getMonth() + parseInt(n));
    return dt;
};

//获得本周的起始日期
Date.prototype.getWeekStartDate = function () {
    var w = this.getDay();
    return this.getOffsetDate(w === 0 ? -6 : 1 - w);
};
//得到本周的结束日期
Date.prototype.getWeekEndDate = function () {
    var w = this.getDay();
    return this.getOffsetDate(w === 0 ? 0 : 7 - w);
};

/** Checks date and time equality */
Date.prototype.equalsTo = function (date) {
    return ((this.getFullYear() == date.getFullYear()) &&
    (this.getMonth() == date.getMonth()) &&
    (this.getDate() == date.getDate()) &&
    (this.getHours() == date.getHours()) &&
    (this.getMinutes() == date.getMinutes()) &&
    (this.getSeconds() == date.getSeconds()));
};

/** Set only the year, month, date parts (keep existing time) */
Date.prototype.setDateOnly = function (date) {
    var tmp = Date.getDate(date);
    this.setDate(1);
    this.setFullYear(tmp.getFullYear());
    this.setMonth(tmp.getMonth());
    this.setDate(tmp.getDate());
};
/** Prints the date in a string according to the given format. */
Date.prototype.print = function (str) {
    var m = this.getMonth();
    var d = this.getDate();
    var y = this.getFullYear();
    var wn = this.getWeekNumber();
    var qr = this.getQuarter();
    var w = this.getDay();
    var s = {};
    var hr = this.getHours();
    var pm = (hr >= 12);
    var ir = (pm) ? (hr - 12) : hr;
    var dy = this.getDayOfYear();
    if (ir == 0) {
        ir = 12;
    }
    var min = this.getMinutes();
    var sec = this.getSeconds();
    s["%a"] = Date._SDN[w]; // abbreviated weekday name [FIXME: I18N]
    s["%A"] = Date._DN[w]; // full weekday name
    s["%b"] = Date._SMN[m]; // abbreviated month name [FIXME: I18N]
    s["%B"] = Date._MN[m]; // full month name
    // FIXME: %c : preferred date and time representation for the current locale
    s["%C"] = 1 + Math.floor(y / 100); // the century number
    s["%d"] = (d < 10) ? ("0" + d) : d; // the day of the month (range 01 to 31)
    s["%e"] = d; // the day of the month (range 1 to 31)
    // FIXME: %D : american date style: %m/%d/%y
    // FIXME: %E, %F, %G, %g, %h (man strftime)
    s["%H"] = (hr < 10) ? ("0" + hr) : hr; // hour, range 00 to 23 (24h format)
    s["%I"] = (ir < 10) ? ("0" + ir) : ir; // hour, range 01 to 12 (12h format)
    s["%j"] = (dy < 100) ? ((dy < 10) ? ("00" + dy) : ("0" + dy)) : dy; // day of the year (range 001 to 366)
    s["%k"] = hr;		// hour, range 0 to 23 (24h format)
    s["%l"] = ir;		// hour, range 1 to 12 (12h format)
    s["%X"] = (m < 9) ? ("0" + (1 + m)) : (1 + m); // month, range 01 to 12
    s["%x"] = m + 1 // month, range 1 to 12
    s["%M"] = (min < 10) ? ("0" + min) : min; // minute, range 00 to 59
    s["%n"] = "\n";		// a newline character
    s["%p"] = pm ? "PM" : "AM";
    s["%P"] = pm ? "pm" : "am";
    // FIXME: %r : the time in am/pm notation %I:%M:%S %p
    // FIXME: %R : the time in 24-hour notation %H:%M
    s["%s"] = Math.floor(this.getTime() / 1000);
    s["%S"] = (sec < 10) ? ("0" + sec) : sec; // seconds, range 00 to 59
    s["%t"] = "\t";		// a tab character
    // FIXME: %T : the time in 24-hour notation (%H:%M:%S)
    s["%U"] = s["%W"] = s["%V"] = (wn < 10) ? ("0" + wn) : wn;
    s["%u"] = w + 1;	// the day of the week (range 1 to 7, 1 = MON)
    s["%w"] = w;		// the day of the week (range 0 to 6, 0 = SUN)
    // FIXME: %x : preferred date representation for the current locale without the time
    // FIXME: %X : preferred time representation for the current locale without the date
    s["%y"] = ('' + y).substr(2, 2); // year without the century (range 00 to 99)
    s["%Y"] = y;		// year with the century
    s["%%"] = "%";		// a literal '%' character
    s["%Q"] = qr;

    var re = /%./g;
    if (!BI.isKhtml()) {
        return str.replace(re, function (par) {
            return s[par] || par;
        });
    }

    var a = str.match(re);
    for (var i = 0; i < a.length; i++) {
        var tmp = s[a[i]];
        if (tmp) {
            re = new RegExp(a[i], 'g');
            str = str.replace(re, tmp);
        }
    }

    return str;
};

/**
 * 是否是闰年
 * @param year
 * @returns {boolean}
 */
Date.isLeap = function (year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

/**
 * 检测是否在有效期
 *
 * @param YY 年
 * @param MM 月
 * @param DD 日
 * @param minDate '1900-01-01'
 * @param maxDate '2099-12-31'
 * @returns {Array} 若无效返回无效状态
 */
Date.checkVoid = function (YY, MM, DD, minDate, maxDate) {
    var back = [];
    YY = YY | 0;
    MM = MM | 0;
    DD = DD | 0;
    minDate = BI.isString(minDate) ? minDate.match(/\d+/g) : minDate;
    maxDate = BI.isString(maxDate) ? maxDate.match(/\d+/g) : maxDate;
    if (YY < minDate[0]) {
        back = ['y'];
    } else if (YY > maxDate[0]) {
        back = ['y', 1];
    } else if (YY >= minDate[0] && YY <= maxDate[0]) {
        if (YY == minDate[0]) {
            if (MM < minDate[1]) {
                back = ['m'];
            } else if (MM == minDate[1]) {
                if (DD < minDate[2]) {
                    back = ['d'];
                }
            }
        }
        if (YY == maxDate[0]) {
            if (MM > maxDate[1]) {
                back = ['m', 1];
            } else if (MM == maxDate[1]) {
                if (DD > maxDate[2]) {
                    back = ['d', 1];
                }
            }
        }
    }
    return back;
};

Date.checkLegal = function (str) {
    var ar = str.match(/\d+/g);
    var YY = ar[0] | 0, MM = ar[1] | 0, DD = ar[2] | 0;
    if (ar.length <= 1) {
        return true;
    }
    if (ar.length <= 2) {
        return MM >= 1 && MM <= 12;
    }
    var MD = Date._MD.slice(0);
    MD[1] = Date.isLeap(YY) ? 29 : 28;
    return MM >= 1 && MM <= 12 && DD <= MD[MM - 1];
};

Date.parseDateTime = function (str, fmt) {
    var today = Date.getDate();
    var y = 0;
    var m = 0;
    var d = 1;
    //wei : 对于fmt为‘YYYYMM’或者‘YYYYMMdd’的格式，str的值为类似'201111'的形式，因为年月之间没有分隔符，所以正则表达式分割无效，导致bug7376。
    var a = str.split(/\W+/);
    if (fmt.toLowerCase() == '%y%x' || fmt.toLowerCase() == '%y%x%d') {
        var yearlength = 4;
        var otherlength = 2;
        a[0] = str.substring(0, yearlength);
        a[1] = str.substring(yearlength, yearlength + otherlength);
        a[2] = str.substring(yearlength + otherlength, yearlength + otherlength * 2);
    }
    var b = fmt.match(/%./g);
    var i = 0, j = 0;
    var hr = 0;
    var min = 0;
    var sec = 0;
    for (i = 0; i < a.length; ++i) {
        switch (b[i]) {
            case "%d":
            case "%e":
                d = parseInt(a[i], 10);
                break;

            case "%X":
                m = parseInt(a[i], 10) - 1;
                break;
            case "%x":
                m = parseInt(a[i], 10) - 1;
                break;

            case "%Y":
            case "%y":
                y = parseInt(a[i], 10);
                (y < 100) && (y += (y > 29) ? 1900 : 2000);
                break;

            case "%b":
            case "%B":
                for (j = 0; j < 12; ++j) {
                    if (Date._MN[j].substr(0, a[i].length).toLowerCase() == a[i].toLowerCase()) {
                        m = j;
                        break;
                    }
                }
                break;

            case "%H":
            case "%I":
            case "%k":
            case "%l":
                hr = parseInt(a[i], 10);
                break;

            case "%P":
            case "%p":
                if (/pm/i.test(a[i]) && hr < 12) {
                    hr += 12;
                } else if (/am/i.test(a[i]) && hr >= 12) {
                    hr -= 12;
                }
                break;

            case "%M":
                min = parseInt(a[i], 10);
            case "%S":
                sec = parseInt(a[i], 10);
                break;
        }
    }
//    if (!a[i]) {
//        continue;
//	}
    if (isNaN(y)) {
        y = today.getFullYear();
    }
    if (isNaN(m)) {
        m = today.getMonth();
    }
    if (isNaN(d)) {
        d = today.getDate();
    }
    if (isNaN(hr)) {
        hr = today.getHours();
    }
    if (isNaN(min)) {
        min = today.getMinutes();
    }
    if (isNaN(sec)) {
        sec = today.getSeconds();
    }
    if (y != 0) {
        return Date.getDate(y, m, d, hr, min, sec);
    }
    y = 0;
    m = -1;
    d = 0;
    for (i = 0; i < a.length; ++i) {
        if (a[i].search(/[a-zA-Z]+/) != -1) {
            var t = -1;
            for (j = 0; j < 12; ++j) {
                if (Date._MN[j].substr(0, a[i].length).toLowerCase() == a[i].toLowerCase()) {
                    t = j;
                    break;
                }
            }
            if (t != -1) {
                if (m != -1) {
                    d = m + 1;
                }
                m = t;
            }
        } else if (parseInt(a[i], 10) <= 12 && m == -1) {
            m = a[i] - 1;
        } else if (parseInt(a[i], 10) > 31 && y == 0) {
            y = parseInt(a[i], 10);
            (y < 100) && (y += (y > 29) ? 1900 : 2000);
        } else if (d == 0) {
            d = a[i];
        }
    }
    if (y == 0) {
        y = today.getFullYear();
    }
    if (m != -1 && d != 0) {
        return Date.getDate(y, m, d, hr, min, sec);
    }
    return today;
};

Date.getDate = function () {
    var dt = new (Function.prototype.bind.apply(Date, BI.concat([null], [].slice.apply(arguments))))();
    if(BI.isNotNull(Date.timeZone) && (arguments.length === 0 || (arguments.length === 1 && BI.isNumber(arguments[0])))){
        var localTime = dt.getTime();
        var localOffset = dt.getTimezoneOffset() * 60000; //获得当地时间偏移的毫秒数
        var utc = localTime + localOffset; //utc即GMT时间标准时区
        return new Date(utc + Date.timeZone);//+ Pool.timeZone.offset);
    }else{
        return dt;
    }
};

Date.getTime = function () {
    var dt = Function.prototype.bind.apply(Date.getDate, BI.concat([null], [].slice.apply(arguments)))();
    if(BI.isNotNull(Date.timeZone)){
        return dt.getTime() - Date.timeZone - dt.getTimezoneOffset() * 60000;
    }else{
        return dt.getTime();
    }
};
