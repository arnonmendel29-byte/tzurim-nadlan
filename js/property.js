(function () {
  var root = document.querySelector("[data-property]");
  if (!root) return;

  var items = Array.isArray(window.LISTINGS) ? window.LISTINGS : [];
  var params = new URLSearchParams(window.location.search);
  var id = (params.get("id") || "").trim();
  var item = items.filter(function (entry) {
    return entry && (entry.slug === id || entry.id === id);
  })[0];

  function textOf(value) {
    return String(value || "").trim();
  }

  function whatsappHref(message) {
    return "https://wa.me/972542324527?text=" + encodeURIComponent(message);
  }

  function addParagraphs(parent, paragraphs) {
    (paragraphs || []).forEach(function (text) {
      var value = textOf(text);
      if (!value) return;
      var p = document.createElement("p");
      p.textContent = value;
      parent.append(p);
    });
  }

  if (!item) {
    document.title = "הנכס לא נמצא | צורים נדל״ן";
    var missing = document.createElement("div");
    missing.className = "property-missing";
    var eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "נכסים";
    var heading = document.createElement("h1");
    heading.textContent = "הנכס לא נמצא";
    var note = document.createElement("p");
    note.textContent = "אין עמוד שמתאים לקישור הזה. אפשר לחזור לרשימת הנכסים.";
    var back = document.createElement("a");
    back.className = "btn btn-line";
    back.href = "index.html#listings";
    back.textContent = "לנכסים הנבחרים";
    missing.append(eyebrow, heading, note, back);
    root.replaceChildren(missing);
    return;
  }

  document.title = item.title + " | צורים נדל״ן";

  var layout = document.createElement("div");
  layout.className = "property-layout";

  var gallery = document.createElement("div");
  gallery.className = "property-gallery";
  var images = (Array.isArray(item.images) ? item.images : []).filter(function (image) {
    return image && textOf(image.src);
  });

  if (!images.length) {
    var pending = document.createElement("p");
    pending.className = "gallery-pending";
    pending.textContent = "הגלריה מוכנה. התמונות יתווספו כאן רק אחרי שיוך מאומת לנכס.";
    gallery.append(pending);
  } else {
    var stage = document.createElement("figure");
    stage.className = "property-stage";
    var mainImage = document.createElement("img");
    mainImage.src = images[0].src;
    mainImage.alt = textOf(images[0].alt) || item.title;
    mainImage.decoding = "async";
    stage.append(mainImage);
    gallery.append(stage);

    if (images.length > 1) {
      var thumbs = document.createElement("div");
      thumbs.className = "property-thumbs";
      images.forEach(function (image, index) {
        var button = document.createElement("button");
        button.type = "button";
        button.setAttribute("aria-label", textOf(image.alt) || "תמונה " + (index + 1));
        if (index === 0) button.setAttribute("aria-current", "true");
        var thumb = document.createElement("img");
        thumb.src = image.src;
        thumb.alt = "";
        button.append(thumb);
        button.addEventListener("click", function () {
          mainImage.src = image.src;
          mainImage.alt = textOf(image.alt) || item.title;
          Array.prototype.forEach.call(thumbs.querySelectorAll("button"), function (node) {
            node.removeAttribute("aria-current");
          });
          button.setAttribute("aria-current", "true");
        });
        thumbs.append(button);
      });
      gallery.append(thumbs);
    }
  }

  var summary = document.createElement("div");
  summary.className = "property-summary";
  var kicker = document.createElement("p");
  kicker.className = "eyebrow property-kicker";
  kicker.textContent = "נכס נבחר";
  var title = document.createElement("h1");
  title.textContent = item.title;
  summary.append(kicker, title);

  if (item.demo) {
    var demo = document.createElement("p");
    demo.className = "listing-demo";
    demo.textContent = "המחשה בלבד";
    summary.append(demo);
  }

  if (textOf(item.location)) {
    var place = document.createElement("p");
    place.className = "property-place";
    place.textContent = item.location;
    summary.append(place);
  }

  var facts = document.createElement("dl");
  facts.className = "property-facts";
  (item.facts || []).forEach(function (fact) {
    if (!fact || !textOf(fact.value)) return;
    var wrap = document.createElement("div");
    var dt = document.createElement("dt");
    dt.textContent = textOf(fact.label);
    var dd = document.createElement("dd");
    dd.textContent = textOf(fact.value);
    wrap.append(dt, dd);
    facts.append(wrap);
  });
  if (facts.childElementCount) summary.append(facts);

  var actions = document.createElement("div");
  actions.className = "listing-actions";
  if (textOf(item.whatsapp)) {
    var talk = document.createElement("a");
    talk.className = "btn btn-yellow";
    talk.href = whatsappHref(item.whatsapp);
    talk.target = "_blank";
    talk.rel = "noopener noreferrer";
    talk.textContent = "לפרטים בוואטסאפ";
    actions.append(talk);
  }
  var phone = document.createElement("a");
  phone.className = "btn btn-line";
  phone.href = "tel:+972542324527";
  phone.textContent = "054-232-4527";
  actions.append(phone);
  summary.append(actions);

  layout.append(gallery, summary);

  var body = document.createElement("div");
  body.className = "property-body";

  if ((item.paragraphs || []).some(textOf)) {
    var details = document.createElement("section");
    var detailsTitle = document.createElement("h2");
    detailsTitle.textContent = "פרטי הנכס";
    details.append(detailsTitle);
    addParagraphs(details, item.paragraphs);
    body.append(details);
  }

  (item.groups || []).forEach(function (group) {
    var points = (group.items || []).map(textOf).filter(Boolean);
    if (!points.length || !textOf(group.title)) return;
    var section = document.createElement("section");
    var heading = document.createElement("h2");
    heading.textContent = group.title;
    var list = document.createElement("ul");
    list.className = "property-points";
    points.forEach(function (point) {
      var li = document.createElement("li");
      li.textContent = point;
      list.append(li);
    });
    section.append(heading, list);
    body.append(section);
  });

  if (textOf(item.surroundings)) {
    var area = document.createElement("section");
    var areaTitle = document.createElement("h2");
    areaTitle.textContent = "מיקום וסביבה";
    var areaText = document.createElement("p");
    areaText.textContent = item.surroundings;
    area.append(areaTitle, areaText);
    body.append(area);
  }

  var contact = document.createElement("section");
  contact.className = "property-contact";
  var contactEyebrow = document.createElement("p");
  contactEyebrow.className = "eyebrow";
  contactEyebrow.textContent = "יצירת קשר";
  var contactTitle = document.createElement("h2");
  contactTitle.textContent = "לפרטים נוספים על " + (textOf(item.settlement) || "הנכס");
  var contactText = document.createElement("p");
  contactText.textContent = "אפשר לפנות לעמרני בוואטסאפ או בטלפון ולקבל מידע נוסף על הנכס.";
  var contactActions = document.createElement("div");
  contactActions.className = "listing-actions";
  if (textOf(item.whatsapp)) {
    var contactTalk = document.createElement("a");
    contactTalk.className = "btn btn-yellow";
    contactTalk.href = whatsappHref(item.whatsapp);
    contactTalk.target = "_blank";
    contactTalk.rel = "noopener noreferrer";
    contactTalk.textContent = "לפרטים בוואטסאפ";
    contactActions.append(contactTalk);
  }
  var contactPhone = document.createElement("a");
  contactPhone.className = "phone-link";
  contactPhone.href = "tel:+972542324527";
  contactPhone.textContent = "054-232-4527";
  contactActions.append(contactPhone);
  contact.append(contactEyebrow, contactTitle, contactText, contactActions);
  body.append(contact);

  root.replaceChildren(layout, body);
})();
