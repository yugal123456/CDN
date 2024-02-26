import Element from '/public/js/global/modules/element.js'

document.addEventListener('dpLoaded', dp);

export default async function dpInit(name = 'datepicker', elementTag = 'date-picker') {

    const theThing = _(`${elementTag}`);
    theThing.innerHTML = `
		<div id="${name}" class="date-range js-date-range" data-date-format='m-d-y'>
			<div class="date-range__input js-date-range__input">
				<input type="text" id="from-date" name="from-${name}" class="js-date-range__text js-date-range__text--start" aria-label="Select start date, format is mm/dd/yyyy">
			</div>
			<div class="date-range__input js-date-range__input">
				<input type="text" id="to-date" name="to-${name}" class="js-date-range__text js-date-range__text--end" aria-label="Select end date, format is mm/dd/yyyy">
			</div>
			<button class="btn btn--subtle height-100% js-date-range__trigger js-tab-focus" aria-label="Select start and end dates using the calendar widget">
				<svg class="icon margin-right-xxs" aria-hidden="true" viewBox="0 0 20 20">
					<g fill="none" stroke="currentColor" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2">
						<rect x="1" y="4" width="18" height="14" rx="1"/>
						<line x1="5" y1="1" x2="5" y2="4"/>
						<line x1="15" y1="1" x2="15" y2="4"/>
						<line x1="1" y1="9" x2="19" y2="9"/>
					</g>
				</svg>
				<span class="js-date-range__trigger-label" aria-hidden="true">
				<span>Select dates</span>
				<span class="is-hidden">
				<i class="js-date-range__value js-date-range__value--start">Start date</i> - <i class="js-date-range__value js-date-range__value--end">End date</i>
				</span>
				</span>
			</button>
			<div class="date-picker js-date-picker" role="dialog" aria-labelledby="calendar-label-1">
				<header class="date-picker__header">
					<div class="date-picker__month">
						<span class="date-picker__month-label js-date-picker__month-label" id="calendar-label-1"></span> <!-- this will contain month label + year -->
						<nav>
							<ul class="date-picker__month-nav js-date-picker__month-nav">
								<li>
									<button class="reset date-picker__month-nav-btn js-date-picker__month-nav-btn js-date-picker__month-nav-btn--prev js-tab-focus">
										<svg class="icon icon--xs" viewBox="0 0 16 16">
											<title>Previous month</title>
											<polyline points="10 2 4 8 10 14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
										</svg>
									</button>
								</li>
								<li>
									<button class="reset date-picker__month-nav-btn js-date-picker__month-nav-btn js-date-picker__month-nav-btn--next js-tab-focus">
										<svg class="icon icon--xs" viewBox="0 0 16 16">
											<title>Next month</title>
											<polyline points="6 2 12 8 6 14" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
										</svg>
									</button>
								</li>
							</ul>
						</nav>
					</div>
					<ol class="date-picker__week">
						<li>
							<div class="date-picker__day">S<span class="sr-only">unday</span></div>
						</li>
						<li>
							<div class="date-picker__day">M<span class="sr-only">onday</span></div>
						</li>
						<li>
							<div class="date-picker__day">T<span class="sr-only">uesday</span></div>
						</li>
						<li>
							<div class="date-picker__day">W<span class="sr-only">ednesday</span></div>
						</li>
						<li>
							<div class="date-picker__day">T<span class="sr-only">hursday</span></div>
						</li>
						<li>
							<div class="date-picker__day">F<span class="sr-only">riday</span></div>
						</li>
						<li>
							<div class="date-picker__day">S<span class="sr-only">aturday</span></div>
						</li>
					</ol>
				</header>
				<ol class="ol-${name} date-picker__dates js-date-picker__dates" aria-labelledby="calendar-label-1">
					<!-- days will be created using js -->
				</ol>
			</div>
		</div>
	`;

    (new Element('link'))
        .set({ 'href': '/public/css/codyhouse/date-picker.css', 'rel': 'stylesheet' })
        .inject('head');

    (new Element('link'))
        .set({ 'href': '/public/css/codyhouse/date-range2.css', 'rel': 'stylesheet' })
        .inject('head');

    (new Element('script'))
        .set({ 'onload': 'dp', 'src': '/public/js/codyhouse/date-picker.js' })
        .inject('head');

    const info = {
        setToDate: function () { info.toDate = document.querySelector(`[name="to-${name}"]`).value },
        setFromDate: function () { info.fromDate = document.querySelector(`[name="from-${name}"]`).value },
        toDate: '',
        fromDate: '',
    };

    document.querySelector(`.ol-${name}`).onclick = async () => {
        await delay(1);
        info.fromDate = document.querySelector(`[name="from-${name}"]`).value;
        info.toDate = document.querySelector(`[name="to-${name}"]`).value;
    }

    return info;
}

function dp() {
    const dr = _('#datepicker');
    new DateRange({ element: dr, dateFormat: 'm-d-y' });
}