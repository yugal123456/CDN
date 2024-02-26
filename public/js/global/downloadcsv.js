log('downloadcsv.js loaded');

/**
 * feed function 2D array to download csv file automatically
 *
 * @param Array array 2d array to create csv from
 * @param String filename what to name the file, without extension
 * @param HTMLElement element to download on
 * @param bool auto auto download or wait for button click
*/
export default function downloadCsv(array, filename = 'export', element=_('#download'), auto = false){
    const csvContent =
        array.map(row =>
                row
                .map(String)
                .map(v => v.replaceAll('"','""'))
                .map(v => `"${v}"`)
                .join(',')
        ).join('\r\n');
    const blob = new Blob([csvContent], {type: 'data:text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const pom = element;// = document.createElement('a'); // NOTE: this has to be an achor tag
    pom.href = url;
    pom.setAttribute('download', `${filename}.csv`);

    if(auto)
        pom.click();
}
