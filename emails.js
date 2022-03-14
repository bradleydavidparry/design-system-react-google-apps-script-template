function sendEmail(emailObject) {
  const { template, infoObject } = emailObject;

  switch (template) {
    case "Contracting Requirement Submit Message Contracting Team":
      MailApp.sendEmail({
        to: "gds-contracting@digital.cabinet-office.gov.uk", // "bradley.parry@digital.cabinet-office.gov.uk",
        subject: `New Contracting Requirement Submitted`,
        htmlBody: ConvertGoogleDocToCleanHtml(
          contractorRequirmentSubmittedMessageToContractingTeam,
          infoObject
        ),
        noReply: true,
      });
      break;
    case "Contracting Requirement Submit Message Finance Team":
      MailApp.sendEmail({
        to: "james.murphy@digital.cabinet-office.gov.uk,ajitha.jeyakumar@digital.cabinet-office.gov.uk", //"bradley.parry@digital.cabinet-office.gov.uk",
        subject: `New Contracting Requirement Submitted`,
        htmlBody: ConvertGoogleDocToCleanHtml(
          contractorRequirmentSubmittedMessageToFinanceTeam,
          infoObject
        ),
        noReply: true,
      });
      break;

    case "Contracting Requirement Approval Message":
      MailApp.sendEmail({
        to: infoObject.CreatedBy,
        subject: `${infoObject.ID} - Contracting Requirement Approved`,
        htmlBody: ConvertGoogleDocToCleanHtml(
          contractorRequirmentApproved,
          infoObject
        ),
        noReply: true,
      });
      break;

    case "L&D Approval Message":
      MailApp.sendEmail({
        to: infoObject.CreatedBy,
        subject: `${infoObject.ID} - Learning & Development Request Approved`,
        htmlBody: ConvertGoogleDocToCleanHtml(lAndDApprovalMessage, infoObject),
        noReply: true,
      });
      break;
    case "R&R Approval Message":
      MailApp.sendEmail({
        to: infoObject.CreatedBy,
        subject: `${infoObject.ID} - ${infoObject.NomineesFullName} - Reward & Recognition Request Approved`,
        htmlBody: ConvertGoogleDocToCleanHtml(rAndRApprovalMessage, infoObject),
        noReply: true,
      });
      break;
    case "R&R Actioned Message":
      MailApp.sendEmail({
        to: infoObject.CreatedBy,
        subject: `${infoObject.ID} - ${infoObject.NomineesFullName} - Reward & Recognition Request Approved`,
        htmlBody: ConvertGoogleDocToCleanHtml(rAndRActionedMessage, infoObject),
        noReply: true,
      });
      break;
    case "CS Vacancy Approved Message":
      MailApp.sendEmail({
        to:
          infoObject.CreatedBy +
          ",gds-recruitment@digital.cabinet-office.gov.uk",
        subject: `${infoObject.ID} - ${infoObject.jobTitle} - Civil Servant Vacancy Approved`,
        htmlBody: ConvertGoogleDocToCleanHtml(csVacApprovedMessage, infoObject),
        noReply: true,
      });
      break;
    case "CS Vacancy Submitted Message":
      MailApp.sendEmail({
        to: "james.murphy@digital.cabinet-office.gov.uk,ajitha.jeyakumar@digital.cabinet-office.gov.uk",
        subject: `${infoObject.jobTitle} - ${infoObject.team} - Civil Servant Vacancy Submitted`,
        htmlBody: ConvertGoogleDocToCleanHtml(
          csVacSubmittedMessage,
          infoObject
        ),
        noReply: true,
      });
      break;
    default:
      break;
  }
}

function ConvertGoogleDocToCleanHtml(url, infoObject) {
  var body = DocumentApp.openByUrl(url).getBody();
  var numChildren = body.getNumChildren();
  var output = [];
  var images = [];
  var listCounters = {};

  // Walk through all the child elements of the body.
  for (var i = 0; i < numChildren; i++) {
    var child = body.getChild(i);
    output.push(processItem(child, listCounters, images));
  }

  var html = output.join("\r");

  for (var key in infoObject) {
    html = html.replace(`{{${key}}}`, infoObject[key]);
  }

  return html;
}

function createDocumentForHtml(html, images) {
  var name = DocumentApp.getActiveDocument().getName() + ".html";
  var newDoc = DocumentApp.create(name);
  newDoc.getBody().setText(html);
  for (var j = 0; j < images.length; j++)
    newDoc.getBody().appendImage(images[j].blob);
  newDoc.saveAndClose();
}

function processItem(item, listCounters, images) {
  var output = [];
  var prefix = "",
    suffix = "";

  if (item.getType() == DocumentApp.ElementType.PARAGRAPH) {
    switch (item.getHeading()) {
      // Add a # for each heading level. No break, so we accumulate the right number.
      case DocumentApp.ParagraphHeading.HEADING6:
        (prefix = "<h6>"), (suffix = "</h6>");
        break;
      case DocumentApp.ParagraphHeading.HEADING5:
        (prefix = "<h5>"), (suffix = "</h5>");
        break;
      case DocumentApp.ParagraphHeading.HEADING4:
        (prefix = "<h4>"), (suffix = "</h4>");
        break;
      case DocumentApp.ParagraphHeading.HEADING3:
        (prefix = "<h3>"), (suffix = "</h3>");
        break;
      case DocumentApp.ParagraphHeading.HEADING2:
        (prefix = "<h2>"), (suffix = "</h2>");
        break;
      case DocumentApp.ParagraphHeading.HEADING1:
        (prefix = "<h1>"), (suffix = "</h1>");
        break;
      default:
        (prefix = "<p>"), (suffix = "</p>");
    }

    if (item.getNumChildren() == 0) return "";
  } else if (item.getType() == DocumentApp.ElementType.INLINE_IMAGE) {
    processImage(item, images, output);
  } else if (item.getType() === DocumentApp.ElementType.LIST_ITEM) {
    var listItem = item;
    var gt = listItem.getGlyphType();
    var key = listItem.getListId() + "." + listItem.getNestingLevel();
    var counter = listCounters[key] || 0;

    // First list item
    if (counter == 0) {
      // Bullet list (<ul>):
      if (
        gt === DocumentApp.GlyphType.BULLET ||
        gt === DocumentApp.GlyphType.HOLLOW_BULLET ||
        gt === DocumentApp.GlyphType.SQUARE_BULLET
      ) {
        (prefix = "<ul><li>"), (suffix = "</li>");

        suffix += "</ul>";
      } else {
        // Ordered list (<ol>):
        (prefix = "<ol><li>"), (suffix = "</li>");
      }
    } else {
      prefix = "<li>";
      suffix = "</li>";
    }

    if (
      item.isAtDocumentEnd() ||
      (item.getNextSibling() &&
        item.getNextSibling().getType() != DocumentApp.ElementType.LIST_ITEM)
    ) {
      if (
        gt === DocumentApp.GlyphType.BULLET ||
        gt === DocumentApp.GlyphType.HOLLOW_BULLET ||
        gt === DocumentApp.GlyphType.SQUARE_BULLET
      ) {
        suffix += "</ul>";
      } else {
        // Ordered list (<ol>):
        suffix += "</ol>";
      }
    }

    counter++;
    listCounters[key] = counter;
  }

  output.push(prefix);

  if (item.getType() == DocumentApp.ElementType.TEXT) {
    processText(item, output);
  } else {
    if (item.getNumChildren) {
      var numChildren = item.getNumChildren();

      // Walk through all the child elements of the doc.
      for (var i = 0; i < numChildren; i++) {
        var child = item.getChild(i);
        output.push(processItem(child, listCounters, images));
      }
    }
  }

  output.push(suffix);
  return output.join("");
}

function processText(item, output) {
  var text = item.getText();
  var indices = item.getTextAttributeIndices();

  if (indices.length <= 1) {
    // Assuming that a whole para fully italic is a quote
    if (item.isBold()) {
      output.push("<strong>" + text + "</strong>");
    } else if (item.isItalic()) {
      output.push("<blockquote>" + text + "</blockquote>");
    } else if (text.trim().indexOf("http://") == 0) {
      output.push('<a href="' + text + '" rel="nofollow">' + text + "</a>");
    } else if (text.trim().indexOf("https://") == 0) {
      output.push('<a href="' + text + '" rel="nofollow">' + text + "</a>");
    } else {
      output.push(text);
    }
  } else {
    for (var i = 0; i < indices.length; i++) {
      var partAtts = item.getAttributes(indices[i]);
      var startPos = indices[i];
      var endPos = i + 1 < indices.length ? indices[i + 1] : text.length;
      var partText = text.substring(startPos, endPos);

      if (partAtts.ITALIC) {
        output.push("<i>");
      }
      if (partAtts.BOLD) {
        output.push("<strong>");
      }
      if (partAtts.UNDERLINE) {
        output.push("<u>");
      }

      if (partAtts.LINK_URL) {
        output.push(`<a href="${partAtts.LINK_URL}" rel="nofollow">`);
      }

      // If someone has written [xxx] and made this whole text some special font, like superscript
      // then treat it as a reference and make it superscript.
      // Unfortunately in Google Docs, there's no way to detect superscript
      if (partText.indexOf("[") == 0 && partText[partText.length - 1] == "]") {
        output.push("<sup>" + partText + "</sup>");
      } else if (partText.trim().indexOf("http://") == 0) {
        output.push(
          '<a href="' + partText + '" rel="nofollow">' + partText + "</a>"
        );
      } else if (partText.trim().indexOf("https://") == 0) {
        output.push(
          '<a href="' + partText + '" rel="nofollow">' + partText + "</a>"
        );
      } else {
        output.push(partText);
      }

      if (partAtts.LINK_URL) {
        output.push(`</a>`);
      }

      if (partAtts.ITALIC) {
        output.push("</i>");
      }
      if (partAtts.BOLD) {
        output.push("</strong>");
      }
      if (partAtts.UNDERLINE) {
        output.push("</u>");
      }
    }
  }
}

function processImage(item, images, output) {
  images = images || [];
  var blob = item.getBlob();
  var contentType = blob.getContentType();
  var extension = "";
  if (/\/png$/.test(contentType)) {
    extension = ".png";
  } else if (/\/gif$/.test(contentType)) {
    extension = ".gif";
  } else if (/\/jpe?g$/.test(contentType)) {
    extension = ".jpg";
  } else {
    throw "Unsupported image type: " + contentType;
  }
  var imagePrefix = "Image_";
  var imageCounter = images.length;
  var name = imagePrefix + imageCounter + extension;
  imageCounter++;
  output.push('<img src="cid:' + name + '" />');
  images.push({
    blob: blob,
    type: contentType,
    name: name,
  });
}
