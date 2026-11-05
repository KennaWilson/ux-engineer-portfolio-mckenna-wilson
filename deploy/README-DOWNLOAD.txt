Complete Netlify deploy package (full site including case-study demo videos)

Because GitHub blocks single files over 100MB, the zip is split into parts.

On your Mac (Terminal):

  cd ~/Downloads
  # after downloading both part files into Downloads:
  cat portfolio-netlify-complete.zip.part0 portfolio-netlify-complete.zip.part1 > portfolio-netlify-complete.zip

  # verify, then unzip:
  unzip -t portfolio-netlify-complete.zip
  open portfolio-netlify-complete.zip

Then deploy the unzipped folder with Netlify UI or:
  netlify deploy --prod --dir .
