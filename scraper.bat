@echo off
REM -*- coding: utf-8 -*-
REM تشغيل Python Scraper مع المتطلبات

setlocal enabledelayedexpansion

echo.
echo ═══════════════════════════════════════════════════════
echo  🎬 Wecima Movies Scraper
echo ═══════════════════════════════════════════════════════
echo.

REM التحقق من Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python غير مثبّت أو لم يتم العثور عليه
    echo    تأكد من تثبيت Python وإضافته إلى PATH
    pause
    exit /b 1
)

REM تثبيت المتطلبات
echo 📦 تثبيت المتطلبات...
pip install -q -r scraper-python\requirements.txt
if errorlevel 1 (
    echo ❌ فشل تثبيت المتطلبات
    pause
    exit /b 1
)

echo ✅ المتطلبات مثبتة
echo.

REM تشغيل الـ Scraper
echo 🚀 تشغيل الـ Scraper...
echo.
python scraper-python\scraper.py %*

if errorlevel 1 (
    echo.
    echo ❌ حدث خطأ أثناء تشغيل الـ Scraper
    pause
    exit /b 1
)

echo.
echo ✅ اكتمل الـ Scraper بنجاح
echo   البيانات محفوظة في: public\movies.json
echo.
echo 📝 الخطوات التالية:
echo   1. git add public/movies.json
echo   2. git commit -m "refactor: update movies data"
echo   3. git push
echo.
echo 🚀 Cloudflare سيقوم بـ Build وتنشر الموقع تلقائياً!
echo.
pause
